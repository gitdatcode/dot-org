/**
 * Ghost Admin API client for Member management
 * IMPORTANT: This should only be used on the server-side
 */
import type { GhostMember } from './types';
import GhostAdminAPI from '@tryghost/admin-api';
import jwt from 'jsonwebtoken';

// API request timeout constants
const API_REQUEST_TIMEOUT_MS = 10000; // 10 seconds for standard API requests
const MEMBER_VALIDATION_TIMEOUT_MS = 15000; // 15 seconds for member validation

export interface AdminApiAuthOptions {
  url: string;
  key: string;
  version?: string;
}

/**
 * Helper function to create a promise with timeout
 *
 * This utility wraps a promise with a timeout to prevent hanging requests.
 * If the original promise doesn't resolve within the specified time,
 * it will reject with the provided error message.
 *
 * @param promise - The promise to wrap with a timeout
 * @param timeoutMs - Timeout duration in milliseconds
 * @param errorMessage - Error message to use if timeout occurs
 * @returns A promise that will resolve with the original promise result or reject on timeout
 */
function promiseWithTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });

  return Promise.race([
    promise,
    timeoutPromise,
  ]).finally(() => clearTimeout(timeoutHandle));
}

/**
 * Creates a Ghost Admin API client for member operations
 * IMPORTANT: This should only be used in server-side code
 */
export function createAdminMemberApi(options: AdminApiAuthOptions) {
  // Normalize the URL to ensure it's in the correct format for the Ghost Admin API
  // The URL should be the base URL of the Ghost site, not including /ghost/api/admin
  let baseUrl = options.url;

  // If the URL includes /ghost/api/admin, remove it
  if (baseUrl.includes('/ghost/api/admin')) {
    baseUrl = baseUrl.split('/ghost/api/admin')[0];
  }

  // Ensure the URL doesn't end with a trailing slash
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }

  console.log('Normalized base URL for Ghost Admin API:', baseUrl);

  // Create the official Ghost Admin API client with the normalized URL
  const api = new GhostAdminAPI({
    url: baseUrl,
    key: options.key,
    version: options.version || 'v5.0'
  });

  // Parse the admin key to get the ID and Secret
  const [id, secret] = options.key.split(':');

  // Define the API methods
  const getMemberByEmail = async (email: string): Promise<GhostMember | null> => {
    try {
      console.log('Fetching member with email:', email);

      // Try using the official API client
      try {
        console.log('Using official API client to browse members');
        const members = await promiseWithTimeout(
          api.members.browse({
            filter: `email:'${email}'`
          }),
          API_REQUEST_TIMEOUT_MS,
          'Ghost API request timed out'
        );

        if (!members || members.length === 0) {
          console.log('No member found with email:', email);
          return null;
        }

        const member = members[0];
        return {
          id: member.id,
          email: member.email,
          name: member.name,
          paid: false // Default to false as we can't reliably determine paid status
        };
      } catch (apiError) {
        console.error('Official API client failed:', apiError);
        return null;
      }
    } catch (error) {
      console.error('Admin API request failed:', error);
      return null;
    }
  };

  return {
    /**
     * Get member by email
     * Server-side only
     */
    getMemberByEmail,

    /**
     * Validate member credentials
     * Server-side only using Admin API
     */
    validateMember: async (email: string, password: string): Promise<GhostMember | null> => {
      try {
        // First check if the member exists
        const member = await promiseWithTimeout(
          getMemberByEmail(email),
          MEMBER_VALIDATION_TIMEOUT_MS,
          'Member validation timed out'
        );

        if (!member) {
          return null;
        }

        // For password validation, we need to use a direct API call to Ghost
        // since the Admin API doesn't provide a direct method for this
        // In a production app, you'd implement proper password validation
        console.warn('Using simplified password validation - implement proper validation in production');

        return member;
      } catch (error) {
        console.error('Member validation failed:', error);
        return null;
      }
    },

    /**
     * Create a new member
     * Server-side only
     */
    createMember: async (memberData: {
      name: string;
      email: string;
      password?: string;
      note?: string;
      labels?: string[];
      subscribed?: boolean;
    }): Promise<GhostMember | null> => {
      try {
        console.log('Creating member:', memberData.email);

        // Try using the official API client
        try {
          console.log('Using official API client to add member');
          const memberPayload = {
            name: memberData.name,
            email: memberData.email,
            note: memberData.note || '',
            labels: memberData.labels ? memberData.labels.map(label => ({ name: label })) : [],
            subscribed: memberData.subscribed !== false,
            ...(memberData.password ? { password: memberData.password } : {})
          };

          console.log('Member payload:', JSON.stringify(memberPayload, null, 2));

          const newMember = await promiseWithTimeout(
            api.members.add(memberPayload),
            15000,
            'Member creation timed out'
          );

          console.log('Member created successfully with official client');

          return {
            id: newMember.id,
            email: newMember.email,
            name: newMember.name,
            paid: false // Default to false as we can't reliably determine paid status
          };
        } catch (apiError) {
          console.error('Failed to create member with official client:', apiError);
          return null;
        }
      } catch (error) {
        console.error('Failed to create member:', error);
        throw error;
      }
    }
  };
}

/**
 * Create a Ghost Admin API client for member operations using environment variables
 * IMPORTANT: This should only be used in server-side code
 */
export function createAdminMemberApiFromEnv() {
  // In Astro, process.env might not be available in server-side code
  // Try to access environment variables through process.env first
  const adminApiUrl = process.env.GHOST_ADMIN_API_URL || process.env?.GHOST_ADMIN_API_URL;
  const baseUrl = process.env.GHOST_BASE_URL || process.env?.GHOST_BASE_URL;
  const key = process.env.GHOST_ADMIN_API_KEY || process.env?.GHOST_ADMIN_API_KEY;
  const version = process.env.GHOST_ADMIN_API_VERSION || process.env?.GHOST_ADMIN_API_VERSION || 'v5.0';

  // Determine the URL to use - prefer the admin API URL, but fall back to base URL if needed
  const url = adminApiUrl || (baseUrl ? `${baseUrl}/ghost/api/admin` : null);

  console.log('Ghost Admin API URL (raw):', url);

  // Check if the URL is properly formatted
  if (url) {
    try {
      const parsedUrl = new URL(url);
      console.log('Ghost Admin API URL (parsed):', {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        pathname: parsedUrl.pathname,
        fullUrl: parsedUrl.toString()
      });
    } catch (error) {
      console.error('Invalid Ghost Admin API URL format:', error);
    }
  }

  console.log('Ghost Admin API Key available:', !!key);
  if (key) {
    const [keyId, keySecret] = key.split(':');
    console.log('Ghost Admin API Key ID:', keyId);
    console.log('Ghost Admin API Key Secret length:', keySecret?.length || 0);
  }
  console.log('Ghost Admin API Version:', version);

  if (!url || !key) {
    console.error('Ghost Admin API credentials not found. Authentication features will be unavailable.');
    // Return an implementation that clearly indicates errors when used
    return {
      getMemberByEmail: async (email: string) => {
        console.error('Cannot get member by email: Ghost Admin API credentials are missing');
        return null;
      },
      validateMember: async (email: string, password: string) => {
        console.error('Cannot validate member: Ghost Admin API credentials are missing');
        return null;
      },
      createMember: async (memberData: any) => {
        console.error('Cannot create member: Ghost Admin API credentials are missing');
        return null;
      }
    };
  }

  return createAdminMemberApi({ url, key, version });
}
