export interface ForumComment {
  id: number;
  post: number;
  author: number;
  author_display_name: string;
  content: string;
  parent?: number;
  is_anonymous: boolean;
  is_approved: boolean;
  like_count: number;
  reply_count: number;
  created_at: string;
  updated_at: string;
  replies?: ForumComment[];
}

export interface ForumPost {
  id: number;
  title: string;
  content: string;
  author: number;
  author_display_name: string;
  category: number;
  is_anonymous: boolean;
  is_pinned: boolean;
  is_locked: boolean;
  is_approved: boolean;
  view_count: number;
  like_count: number;
  author_mood?: string;
  created_at: string;
  updated_at: string;
  last_activity: string;
  comment_count?: number;
}

export interface ForumCategory {
  id: number;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  order: number;
  created_at: string;
}
