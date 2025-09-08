import GhostContentAPI from '@tryghost/content-api';

const ghostBaseUrl = process.env.GHOST_BASE_URL || import.meta.env.GHOST_BASE_URL;
const ghostContentApiKey = process.env.GHOST_CONTENT_API_KEY || import.meta.env.GHOST_CONTENT_API_KEY;

// Initialize the Ghost Content API client
const api = new GhostContentAPI({
  url: ghostBaseUrl,
  key: ghostContentApiKey,
  version: 'v5.0'
});

// Get posts from Ghost
export async function getPosts() {
  return await api.posts
    .browse({
      limit: 5,
      include: ['tags', 'authors']
    })
    .catch(err => {
      console.error(err);
      return [];
    });
}

// Get a single post by slug
export async function getPost(slug: string) {
  return await api.posts
    .read({ slug }, { include: ['tags', 'authors'] })
    .catch(err => {
      console.error(err);
      return null;
    });
}

// Get Ghost settings
export async function getGhostSettings() {
  return await api.settings
    .browse()
    .catch(err => {
      console.error(err);
      return null;
    });
}

export default api;
