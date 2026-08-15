import api from './api';
import type { ApiResponse, PagedResponse } from './boatService';

/** Một cảnh trong video: lời đọc + chữ hiện trên màn hình. */
export interface VideoScene {
  narration: string;
  caption?: string | null;
  imageUrl?: string | null;
  durationSeconds: number;
}

export interface BlogPostListItem {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  coverImageUrl?: string | null;
  /** cam_nang | kinh_nghiem | tin_tuc */
  category: string;
  sourceName?: string | null;
  sourceUrl?: string | null;
  publishedAt?: string | null;
  viewCount: number;
  hasVideo: boolean;
}

export interface BlogPostDetail extends BlogPostListItem {
  content?: string | null;
  sourcePublishedAt?: string | null;
  videoScenes: VideoScene[];
}

export const BLOG_CATEGORIES: Record<string, string> = {
  cam_nang: 'Cẩm nang du lịch',
  kinh_nghiem: 'Kinh nghiệm',
  tin_tuc: 'Tin tức mới',
};

export const blogService = {
  getPosts: (params?: {
    category?: string;
    page?: number;
    pageSize?: number;
  }) =>
    api
      .get<ApiResponse<PagedResponse<BlogPostListItem>>>('/public/blog', {
        params,
      })
      .then((r) => r.data.result),

  getBySlug: (slug: string) =>
    api
      .get<ApiResponse<BlogPostDetail>>(`/public/blog/${slug}`)
      .then((r) => r.data.result),
};
