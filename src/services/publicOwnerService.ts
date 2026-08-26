import api from './api';
import type { ApiResponse } from './boatService';

/** Chủ thuyền đã được cảng vụ xác thực, dùng cho khối đối tác ở trang chủ. */
export interface FeaturedOwnerResponse {
  id: string;
  /** User id of the boat owner — used to filter public tours. */
  userId: string;
  name: string;
  /** individual | business | cooperative */
  entityType: string;
  bio?: string | null;
  boatCount: number;
  tourCount: number;
  /** null khi chưa có đánh giá nào — không hiển thị sao. */
  avgRating?: number | null;
  reviewCount: number;
  boatImages: string[];
}

export const publicOwnerService = {
  getFeatured: (take = 3) =>
    api
      .get<ApiResponse<FeaturedOwnerResponse[]>>('/public/owners/featured', {
        params: { take },
      })
      .then((r) => r.data.result ?? []),
};
