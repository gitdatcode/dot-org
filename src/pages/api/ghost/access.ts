import type { APIRoute } from 'astro';
import { getPostBySlug, checkMemberAccess } from '../../../lib/api/ghost';
import { getSession } from '../../../lib/api/session';

// Helper to get session from cookies
function getSessionFromCookies(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const sessionCookie = cookies.find(cookie => cookie.startsWith('ghost_member_session='));

  if (!sessionCookie) return null;

  return sessionCookie.split('=')[1];
}

// POST - Check if the current member has access to a specific post
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { slug } = body;

    if (!slug) {
      return new Response(
        JSON.stringify({ success: false, message: 'Post slug is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the post
    const post = await getPostBySlug(slug);

    if (!post) {
      return new Response(
        JSON.stringify({ success: false, message: 'Post not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If the post is accessible to everyone, allow access
    if (post.access === true) {
      return new Response(
        JSON.stringify({ success: true, hasAccess: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If the post requires membership, check session
    // Get session ID from cookie
    const sessionId = getSessionFromCookies(request);

    // Get member from session
    const member = sessionId ? getSession(sessionId) : null;

    // Check access using our utility function
    const hasAccess = await checkMemberAccess(post, member);

    return new Response(
      JSON.stringify({ success: true, hasAccess }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error checking member access:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Failed to check access' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
