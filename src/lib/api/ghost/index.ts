/**
 * Ghost API exports using official SDK
 */
import GhostContentAPI from '@tryghost/content-api';
import type { GhostAPI, PostOrPage, Nullable, PostsOrPages, Tag, Tags, Settings, Author, Authors } from '@tryghost/content-api';
import type { GhostMember } from './types';

const ghostBaseUrl = process.env.GHOST_BASE_URL || import.meta.env.GHOST_BASE_URL;
const ghostContentApiUrl = process.env.GHOST_CONTENT_API_URL || import.meta.env.GHOST_CONTENT_API_URL;
const ghostContentApiKey = process.env.GHOST_CONTENT_API_KEY || import.meta.env.GHOST_CONTENT_API_KEY;

// Export the useAuth hook
export { useAuth } from './useAuth';

// Check if we have the required environment variables for content API
const hasContentEnvVars = (ghostBaseUrl && ghostContentApiUrl) && ghostContentApiKey;

// Initialize Ghost Content API client if environment variables are available
export const ghostApi = hasContentEnvVars
  ? new GhostContentAPI({
    url: ghostBaseUrl,
    key: ghostContentApiKey,
    version: 'v5.0' // Use proper version format
  })
  : null;

// Log the API initialization for debugging
if (ghostApi && import.meta.env.DEV) {
  console.log('Ghost Content API initialized with base URL:', ghostBaseUrl);
  console.log('Content API Key (first 10 chars):', ghostContentApiKey.substring(0, 10) + '...');
} else {
  console.error('Ghost Content API not initialized. Missing environment variables:', {
    hasBaseUrl: Boolean(ghostBaseUrl),
    hasKey: Boolean(ghostContentApiKey)
  });
}

// Re-export types from the SDK
export type {
  PostOrPage as GhostPost,
  PostsOrPages as GhostPosts,
  Tag as GhostTag,
  Tags as GhostTags,
  Settings as GhostSettings,
  Author as GhostAuthor,
  Authors as GhostAuthors,
  Nullable
};

// Utility function to browse posts with pagination
export async function getPosts(options = {}) {
  // If API is not available, return empty array with error
  if (!ghostApi) {
    console.error('Ghost API is not available. Please set GHOST_CONTENT_API_URL and GHOST_CONTENT_API_KEY environment variables.');
    return [];
  }

  try {
    console.log('Fetching posts with options:', options);
    const posts = await ghostApi.posts.browse({
      include: ['authors', 'tags'],
      limit: 9, // Default limit
      ...options
    });

    console.log(`Successfully fetched ${posts.length} posts`);
    if (posts.length === 0) {
      console.warn('No posts found. This could be due to:');
      console.warn('1. No posts exist in the Ghost instance');
      console.warn('2. All posts are set to draft/scheduled status');
      console.warn('3. Content API access is restricted');
    }

    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    // Return empty array instead of mock data
    return [];
  }
}

// Get posts in text format with minimal fields for faster rendering
export async function getPostsTextFormat(options = {}) {
  // If API is not available, return empty array with error
  if (!ghostApi) {
    console.error('Ghost API is not available. Please set GHOST_CONTENT_API_URL and GHOST_CONTENT_API_KEY environment variables.');
    return [];
  }

  try {
    console.log('Fetching posts in text format with options:', options);
    const posts = await ghostApi.posts.browse({
      // Only include fields needed for PostList/PostCard components
      fields: [
        'id',
        'title', 
        'slug', 
        'excerpt', 
        'feature_image', 
        'published_at', 
        'access',
        'reading_time'
      ],
      formats: ['plaintext'], // Request text format instead of HTML
      include: ['authors', 'tags'], // Still include relationships
      limit: 9, // Default limit
      ...options
    });

    console.log(`Successfully fetched ${posts.length} posts in text format`);
    if (posts.length === 0) {
      console.warn('No posts found. This could be due to:');
      console.warn('1. No posts exist in the Ghost instance');
      console.warn('2. All posts are set to draft/scheduled status');
      console.warn('3. Content API access is restricted');
    }

    return posts;
  } catch (error) {
    console.error('Error fetching posts in text format:', error);
    return [];
  }
}

// Fetch a post by slug
export async function getPostBySlug(slug: string) {
  // If API is not available, return null
  if (!ghostApi) {
    console.error('Ghost API is not available. Please set GHOST_API_URL and GHOST_CONTENT_API_KEY environment variables.');
    return null;
  }

  try {
    return await ghostApi.posts.read({
      slug,
      include: ['authors', 'tags']
    } as any); // Type assertion needed due to incomplete type definitions in the Ghost SDK
  } catch (error) {
    console.error(`Error fetching post with slug ${slug}:`, error);
    // Return null instead of mock data
    return null;
  }
}

// Search for posts
export async function searchPosts(query: string) {
  // If API is not available, return empty array
  if (!ghostApi) {
    console.error('Ghost API is not available. Please set GHOST_API_URL and GHOST_CONTENT_API_KEY environment variables.');
    return [];
  }

  try {
    return await ghostApi.posts.browse({
      limit: 'all',
      include: ['authors', 'tags'],
      filter: `(title:~'${query}',html:~'${query}',excerpt:~'${query}')`
    });
  } catch (error) {
    console.error(`Error searching posts with query ${query}:`, error);
    // Return empty array instead of mock data
    return [];
  }
}

// Get all tags
export async function getTags(options = {}) {
  // If API is not available, return empty array
  if (!ghostApi) {
    console.error('Ghost API is not available. Please set GHOST_API_URL and GHOST_CONTENT_API_KEY environment variables.');
    return [];
  }

  try {
    return await ghostApi.tags.browse({
      limit: 'all',
      ...options
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    // Return empty array instead of mock data
    return [];
  }
}

// Get site settings
export async function getSettings() {
  // If API is not available, return null instead of mock settings
  if (!ghostApi) {
    console.error('Ghost API is not available. Please set GHOST_API_URL and GHOST_CONTENT_API_KEY environment variables.');
    return null;
  }

  try {
    return await ghostApi.settings.browse();
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return null instead of mock settings
    return null;
  }
}

/**
 * Authentication functions
 *
 * IMPORTANT: For all authentication operations (login, logout, getting current member),
 * use the useAuth hook instead of direct function calls.
 *
 * Example:
 * ```tsx
 * import { useAuth } from '../lib/api/ghost';
 *
 * function MyComponent() {
 *   const { member, signIn, signOut } = useAuth();
 *   // Use these functions and state in your component
 * }
 * ```
 */

// Membership tier checking - should only be used server-side
// For client-side access checking, use the Protected component
export const checkMemberAccess = async (post: PostOrPage, member: GhostMember | null): Promise<boolean> => {
  // If the Ghost API is not available, deny access to ensure data integrity
  if (!ghostApi) {
    console.error('Ghost API is not available. Content access cannot be verified.');
    return false;
  }

  // If the post doesn't exist, deny access
  if (!post) {
    console.error('Cannot check access: Post does not exist');
    return false;
  }

  // If the post is accessible to everyone (no access restrictions), allow access
  if ((post as any).access === true) {
    return true;
  }

  // If no member is logged in and post requires access, deny access
  if (!member) {
    return false;
  }

  // Paid members have access to all content
  if (member.paid) {
    return true;
  }

  // Free members can only access public content
  return (post as any).access === true;
};
