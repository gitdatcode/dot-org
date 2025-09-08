// Import the type we want to augment
import type { PostOrPage } from '@tryghost/content-api';

// Extend the PostOrPage interface by declaration merging
declare module '@tryghost/content-api' {
  interface PostOrPage {
    access?: boolean;
  }
}

/**
 * Ghost API types
 */

// Common types
export interface GhostImage {
  url: string;
  alt?: string;
}

export interface GhostAuthor {
  id: string;
  name: string;
  slug: string;
  profile_image?: string;
  bio?: string;
  website?: string;
}

export interface GhostTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  feature_image?: string;
  visibility: 'public' | 'internal' | 'private';
}

// Content API types
export interface GhostPost {
  id: string;
  uuid: string;
  title: string;
  slug: string;
  html: string;
  feature_image?: string;
  featured: boolean;
  excerpt?: string;
  published_at: string;
  updated_at: string;
  authors: GhostAuthor[];
  primary_author: GhostAuthor;
  tags: GhostTag[];
  primary_tag?: GhostTag;
  url: string;
  comment_id?: string;
  reading_time?: number;
  access?: boolean;
}

export interface GhostPage {
  id: string;
  uuid: string;
  title: string;
  slug: string;
  html: string;
  feature_image?: string;
  featured: boolean;
  excerpt?: string;
  published_at: string;
  updated_at: string;
  authors: GhostAuthor[];
  primary_author: GhostAuthor;
  tags: GhostTag[];
  primary_tag?: GhostTag;
  url: string;
  access?: boolean;
}

export interface GhostSettings {
  title: string;
  description: string;
  logo?: string;
  icon?: string;
  accent_color: string;
  cover_image?: string;
  facebook?: string;
  twitter?: string;
  lang: string;
  timezone: string;
  navigation: Array<{ label: string; url: string }>;
  secondary_navigation: Array<{ label: string; url: string }>;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  og_title?: string;
  og_description?: string;
  twitter_image?: string;
  twitter_title?: string;
  twitter_description?: string;
}

// Member API types
export interface GhostMember {
  id?: string;
  uuid?: string;
  email: string;
  name?: string;
  paid?: boolean;
  avatar_image?: string;
  subscriptions?: any[];
  labels?: { name: string }[];
  note?: string;
  subscribed?: boolean;
  password?: string;
}

export interface GhostSubscription {
  id: string;
  status: 'active' | 'canceled' | 'expired' | 'trialing';
  tier: GhostTier;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface GhostTier {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  stripe_price_id?: string;
  monthly_price?: number;
  yearly_price?: number;
  benefits?: string[];
}

// API response types
export interface GhostPaginationParams {
  page?: number;
  limit?: number;
  filter?: string;
  order?: string;
  include?: string;
}

export interface GhostPaginatedResponse<T> {
  meta: {
    pagination: {
      page: number;
      limit: number;
      pages: number;
      total: number;
      next?: number;
      prev?: number;
    };
  };
  data: T[];
}
