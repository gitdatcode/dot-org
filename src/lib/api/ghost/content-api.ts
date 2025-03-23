/**
 * Ghost Content API client
 */
import type { GhostPost, GhostPage, GhostTag, GhostSettings, GhostPaginationParams, GhostPaginatedResponse } from './types';

export interface ContentApiOptions {
  url: string;
  key: string;
  version?: string;
}

/**
 * Create a request URL with the necessary query parameters
 */
function createUrl(options: ContentApiOptions, endpoint: string, params: Record<string, any> = {}): string {
  const url = new URL(`${options.url.replace(/\/$/, '')}/ghost/api/content/${endpoint}`);

  // Add API key
  url.searchParams.append('key', options.key);

  // Add additional parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value.toString());
    }
  });

  return url.toString();
}

/**
 * Make a request to the Ghost Content API
 */
async function fetchFromApi<T>(options: ContentApiOptions, endpoint: string, params: Record<string, any> = {}): Promise<T> {
  try {
    const url = createUrl(options, endpoint, params);
    console.log(`Ghost API request URL: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Ghost API error: ${response.status} ${response.statusText}`);
      console.error(`Request URL: ${url}`);
      const errorText = await response.text().catch(() => 'Could not read error response');
      console.error(`Response body: ${errorText}`);
      throw new Error(`Ghost API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('Ghost Content API request failed:', error);
    throw error;
  }
}

/**
 * Creates a Ghost Content API client
 */
export function createContentApi(options: ContentApiOptions) {
  return {
    /**
     * Get posts from the Ghost Content API
     */
    getPosts: async (params: GhostPaginationParams = {}): Promise<GhostPaginatedResponse<GhostPost>> => {
      return fetchFromApi<GhostPaginatedResponse<GhostPost>>(options, 'posts', {
        ...params,
        include: params.include || 'authors,tags',
      });
    },

    /**
     * Get a single post by slug
     */
    getPostBySlug: async (slug: string): Promise<{ posts: GhostPost[] }> => {
      return fetchFromApi<{ posts: GhostPost[] }>(options, 'posts/slug/' + slug, {
        include: 'authors,tags',
      });
    },

    /**
     * Get pages from the Ghost Content API
     */
    getPages: async (params: GhostPaginationParams = {}): Promise<GhostPaginatedResponse<GhostPage>> => {
      return fetchFromApi<GhostPaginatedResponse<GhostPage>>(options, 'pages', {
        ...params,
        include: params.include || 'authors,tags',
      });
    },

    /**
     * Get a single page by slug
     */
    getPageBySlug: async (slug: string): Promise<{ pages: GhostPage[] }> => {
      return fetchFromApi<{ pages: GhostPage[] }>(options, 'pages/slug/' + slug, {
        include: 'authors,tags',
      });
    },

    /**
     * Get tags from the Ghost Content API
     */
    getTags: async (params: GhostPaginationParams = {}): Promise<GhostPaginatedResponse<GhostTag>> => {
      return fetchFromApi<GhostPaginatedResponse<GhostTag>>(options, 'tags', params);
    },

    /**
     * Get a single tag by slug
     */
    getTagBySlug: async (slug: string): Promise<{ tags: GhostTag[] }> => {
      return fetchFromApi<{ tags: GhostTag[] }>(options, 'tags/slug/' + slug);
    },

    /**
     * Get site settings
     */
    getSettings: async (): Promise<{ settings: GhostSettings }> => {
      return fetchFromApi<{ settings: GhostSettings }>(options, 'settings');
    }
  };
}

/**
 * Create a Ghost Content API client using environment variables
 */
export function createContentApiFromEnv() {
  // Prefer the dedicated base URL if available
  const baseUrl = process.env.GHOST_BASE_URL;
  // Fall back to extracting from the content API URL if needed
  const contentApiUrl = process.env.GHOST_CONTENT_API_URL;
  const key = process.env.GHOST_CONTENT_API_KEY;

  // Determine the final URL to use
  let url = baseUrl;

  if (!url && contentApiUrl) {
    // Extract the base URL from the content API URL if needed
    url = contentApiUrl.replace(/\/ghost\/api\/content\/?$/, '');
    console.log(`Extracted base URL from content API URL: ${url}`);
  }

  if (!url) {
    throw new Error('Neither GHOST_BASE_URL nor GHOST_CONTENT_API_URL environment variable is defined');
  }

  if (!key) {
    throw new Error('GHOST_CONTENT_API_KEY environment variable is not defined');
  }

  console.log(`Creating Ghost Content API client with URL: ${url}`);
  console.log(`API Key (first 10 chars): ${key.substring(0, 10)}...`);

  return createContentApi({ url, key });
}
