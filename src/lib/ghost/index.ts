import GhostContentAPI from '@tryghost/content-api';

// Initialize the Ghost Content API client
const api = new GhostContentAPI({
  url: process.env.SITE_URL || 'https://',
  key: process.env.GHOST_CONTENT_API_KEY || '',
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
