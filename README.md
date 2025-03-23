# DATCODE.org

DATCODE.org is built with Astro and leverages Ghost CMS for content management. This application combines the best of both worlds: fast, static site generation with Astro and powerful content management capabilities of Ghost.

## 🚀 Project Structure

```text
/
├── public/               # Static assets (images, favicons)
├── src/
│   ├── components/       # UI components
│   │   ├── Card.astro    # Basic card component
│   │   ├── PostCard.astro # Card for displaying post previews
│   │   ├── PostList.astro # List of post cards 
│   │   └── ghost/        # Ghost-specific components
│   │       ├── GhostContent.tsx # Renders Ghost HTML content
│   │       ├── GhostRenderer.tsx # Handles different content blocks
│   │       ├── MemberAuth.tsx # Authentication components
│   │       └── cards/    # Specialized card components for Ghost content
│   ├── layouts/          # Page layouts
│   ├── lib/              # Utility functions and API clients
│   │   ├── api/          # API integration
│   │   │   ├── ghost/    # Ghost API clients and types
│   │   │   └── session.ts # Session management
│   │   └── ghost/        # Ghost content utilities
│   ├── pages/            # Page routes
│   │   ├── api/          # API endpoints
│   │   ├── posts/        # Post pages
│   │   └── index.astro   # Homepage
│   └── style/            # Global styles
└── package.json
```

## 📝 Ghost CMS Integration

This project integrates with Ghost CMS for content management and membership features. The integration works as follows:

### Content Fetching

1. **Content API Client**: 
   - Located in `src/lib/api/ghost/index.ts`
   - Initializes the Ghost Content API client using environment variables
   - Provides functions to fetch posts, tags, and site settings

2. **Post Retrieval**: 
   - `getPosts()` - Gets a list of posts with full HTML content
   - `getPostsTextFormat()` - Gets posts in text format with only the fields needed for listings, improving performance
   - `getPostBySlug()` - Gets a specific post by its slug
   - `searchPosts()` - Searches posts by query string

3. **Post Display**:
   - `PostList.astro` - Renders a grid of post cards
   - `PostCard.astro` - Displays a post preview with title, excerpt, feature image, etc.
   - Individual post pages (`[slug].astro`) show the full post content

### Content Rendering

1. **Ghost Content Parser**:
   - `parseGhostContent.ts` - Transforms Ghost HTML content into structured blocks
   - Handles all Ghost card types (gallery, bookmark, product, file, etc.)

2. **Rendering Components**:
   - `GhostContent.tsx` - Main component that processes HTML or fetches from URL
   - `GhostRenderer.tsx` - Renders different block types with appropriate components
   - Card components for specialized content types (galleries, products, etc.)

### Authentication & Membership

1. **Member API Client**:
   - Server-side only client for authenticating members
   - Handles sign in, sign up, and session management

2. **Authentication Flow**:
   - `useAuth.ts` - React hook for client-side authentication state management
   - Provides functions for sign in, sign up, and sign out
   - Tracks authentication state (loading, error, member data)

3. **API Endpoints**:
   - `/api/ghost/member.ts` - Handles member authentication
   - `/api/ghost/access.ts` - Checks content access permissions

4. **Access Control**:
   - `checkMemberAccess()` - Utility to determine if a member can access content
   - Posts can be public or restricted to members only
   - Protected content shows a sign-in prompt for non-members

5. **User Interface**:
   - `UserMenu.tsx` - Displays login/signup buttons or member profile
   - `MemberAuth.tsx` - Authentication components

## 🧞 Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |

## ⚙️ Environment Configuration

You need the following environment variables for Ghost integration:

```
# Ghost Content API (public, for fetching content)
GHOST_BASE_URL=https://your-ghost-blog.com
GHOST_CONTENT_API_KEY=your-content-api-key

# Ghost Admin API (private, for authentication - server-side only)
GHOST_ADMIN_API_KEY=your-admin-api-key
```

## 🌓 Styling

The site uses Tailwind CSS with a custom theme defined in `src/style/global.css`.
