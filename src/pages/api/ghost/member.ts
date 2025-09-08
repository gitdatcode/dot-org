import type { APIRoute } from 'astro';
// Make sure we're importing with the right path
import { createAdminMemberApiFromEnv } from '../../../lib/api/ghost/member-api';
import { createSession, getSession, deleteSession } from '../../../lib/api/session';

// Create the Ghost Admin API client for member operations
// This is server-side only!
const adminMemberApi = createAdminMemberApiFromEnv();

// Cookie name for session
const SESSION_COOKIE = 'ghost_member_session';

// Timeout constants for authentication operations
const SIGNUP_TIMEOUT_MS = 20000; // 20 seconds for signup process
const SIGNIN_TIMEOUT_MS = 15000; // 15 seconds for signin process

// Helper to get session from cookies
function getSessionFromCookies(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const sessionCookie = cookies.find(cookie => cookie.startsWith(`${SESSION_COOKIE}=`));

  if (!sessionCookie) return null;

  return sessionCookie.split('=')[1];
}

// HEAD - Check if auth system is available
export const HEAD: APIRoute = async ({ request }) => {
  try {
    // For a HEAD request, just return a status code based on the API availability
    try {
      // Try to create the API client - if this fails, the API is unavailable
      const api = createAdminMemberApiFromEnv();

      // Get session ID from cookie
      const sessionId = getSessionFromCookies(request);

      // If no session, return 401 (normal authentication flow - not an error)
      if (!sessionId) {
        return new Response(null, { status: 401 });
      }

      // If there's a session, API is available and working
      return new Response(null, { status: 204 });
    } catch (error) {
      // Failed to create API client - API is unavailable
      console.error('Failed to create API client:', error);
      return new Response(null, { status: 500 });
    }
  } catch (error) {
    console.error('Error checking API availability:', error);
    return new Response(null, { status: 500 });
  }
};

// GET - Get current member from session
export const GET: APIRoute = async ({ request }) => {
  try {
    // Get session ID from cookie
    const sessionId = getSessionFromCookies(request);

    if (!sessionId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Not authenticated' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get member from session
    const member = getSession(sessionId);

    if (!member) {
      // Session expired or invalid
      return new Response(
        JSON.stringify({ success: false, message: 'Session expired' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': `${SESSION_COOKIE}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`
          }
        }
      );
    }

    // Return member data (exclude sensitive information)
    return new Response(
      JSON.stringify({
        success: true,
        member: {
          id: member.id,
          email: member.email,
          name: member.name,
          paid: member.paid
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting current member:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Failed to get member' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST - Sign in or Sign up depending on action parameter
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action, email, password, name } = body;

    // Validate request
    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle signup
    if (action === 'signup') {
      if (!name) {
        return new Response(
          JSON.stringify({ success: false, message: 'Name is required for signup' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      try {
        console.log('Starting signup process for:', email);

        // Add a timeout for the entire signup process
        const signupPromise = (async () => {
          try {
            // Check if member already exists
            console.log('Checking if member exists:', email);
            const existingMember = await adminMemberApi.getMemberByEmail(email);

            if (existingMember) {
              console.log('Member already exists with this email');
              return new Response(
                JSON.stringify({ success: false, message: 'Email is already registered', type: 'already_exists' }),
                { status: 409, headers: { 'Content-Type': 'application/json' } }
              );
            }

            console.log('Creating new member:', { name, email });

            // Create the new member
            let member;
            try {
              member = await adminMemberApi.createMember({
                name,
                email,
                password,
                subscribed: true
              });
            } catch (createError) {
              console.error('Error creating member:', createError);
              return new Response(
                JSON.stringify({
                  success: false,
                  message: createError instanceof Error ? createError.message : 'Failed to create account in Ghost'
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
              );
            }

            if (!member) {
              console.error('Failed to create member - null result returned');
              return new Response(
                JSON.stringify({ success: false, message: 'Failed to create account in Ghost' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
              );
            }

            console.log('Member created successfully:', member.email);

            // Create session and set cookie
            const sessionId = createSession(member);

            // Set session cookie (30 days expiry)
            const expires = new Date();
            expires.setDate(expires.getDate() + 30);

            return new Response(
              JSON.stringify({
                success: true,
                member: {
                  id: member.id,
                  email: member.email,
                  name: member.name,
                  paid: member.paid
                }
              }),
              {
                status: 201,
                headers: {
                  'Content-Type': 'application/json',
                  'Set-Cookie': `${SESSION_COOKIE}=${sessionId}; Path=/; Expires=${expires.toUTCString()}; HttpOnly; SameSite=Lax`
                }
              }
            );
          } catch (innerError) {
            console.error('Inner error during signup process:', innerError);
            throw innerError;
          }
        })();

        // Set a timeout for the entire signup process
        const timeoutPromise = new Promise<Response>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Signup process timed out'));
          }, SIGNUP_TIMEOUT_MS);
        });

        // Race the signup process against the timeout
        try {
          return await Promise.race([signupPromise, timeoutPromise]);
        } catch (timeoutError) {
          console.error('Signup process timed out:', timeoutError);
          return new Response(
            JSON.stringify({ success: false, message: 'Signup process timed out. Please try again.' }),
            { status: 504, headers: { 'Content-Type': 'application/json' } }
          );
        }
      } catch (error) {
        console.error('Error during signup process:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
        return new Response(
          JSON.stringify({ success: false, message: errorMessage }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Handle signin (default action)
    else {
      try {
        console.log('Starting signin process for:', email);

        // Add a timeout for the entire signin process
        const signinPromise = (async () => {
          try {
            // Validate member credentials (server-side only!)
            console.log('Validating member credentials');
            const member = await adminMemberApi.validateMember(email, password);

            if (!member) {
              console.log('Invalid credentials for:', email);
              return new Response(
                JSON.stringify({ success: false, message: 'Invalid credentials', type: 'invalid_credentials' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
              );
            }

            console.log('Member authenticated successfully:', member.email);

            // Create session and set cookie
            const sessionId = createSession(member);

            // Set session cookie (30 days expiry)
            const expires = new Date();
            expires.setDate(expires.getDate() + 30);

            return new Response(
              JSON.stringify({
                success: true,
                member: {
                  id: member.id,
                  email: member.email,
                  name: member.name,
                  paid: member.paid
                }
              }),
              {
                status: 200,
                headers: {
                  'Content-Type': 'application/json',
                  'Set-Cookie': `${SESSION_COOKIE}=${sessionId}; Path=/; Expires=${expires.toUTCString()}; HttpOnly; SameSite=Lax`
                }
              }
            );
          } catch (innerError) {
            console.error('Inner error during signin process:', innerError);
            throw innerError;
          }
        })();

        // Set a timeout for the entire signin process
        const timeoutPromise = new Promise<Response>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Signin process timed out'));
          }, SIGNIN_TIMEOUT_MS);
        });

        // Race the signin process against the timeout
        try {
          return await Promise.race([signinPromise, timeoutPromise]);
        } catch (timeoutError) {
          console.error('Signin process timed out:', timeoutError);
          return new Response(
            JSON.stringify({ success: false, message: 'Signin process timed out. Please try again.' }),
            { status: 504, headers: { 'Content-Type': 'application/json' } }
          );
        }
      } catch (error) {
        console.error('Error processing signin request:', error);
        return new Response(
          JSON.stringify({ success: false, message: 'Authentication failed' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  } catch (error) {
    console.error('Error processing authentication request:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Authentication failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// DELETE - Sign out
export const DELETE: APIRoute = async ({ request }) => {
  try {
    // Get session ID from cookie
    const sessionId = getSessionFromCookies(request);

    if (sessionId) {
      // Delete session
      deleteSession(sessionId);
    }

    // Always clear the cookie, even if session wasn't found
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `${SESSION_COOKIE}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`
        }
      }
    );
  } catch (error) {
    console.error('Error signing out member:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Failed to sign out' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
