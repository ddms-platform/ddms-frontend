import { Api } from './axios';
import type { TourSearchItemResponse } from './tourService';

export interface WishlistResponse {
  items: TourSearchItemResponse[];
  totalCount: number;
}

export interface ToggleWishlistResponse {
  isAdded: boolean;
}

const unwrapData = <T>(data: any, fallback: T): T => {
  if (data?.result !== undefined) return data.result as T;
  return (data ?? fallback) as T;
};

const normalizeTourIds = (data: any): string[] => {
  const raw = unwrapData<any>(data, []);
  if (Array.isArray(raw)) return raw.map(String);
  if (Array.isArray(raw?.items)) return raw.items.map(String);
  return [];
};

export const wishlistService = {
  getWishlists: async (): Promise<WishlistResponse> => {
    const response = await Api.get('/wishlists');
    const data = unwrapData<any>(response.data, {});
    return {
      items: Array.isArray(data?.items) ? data.items : [],
      totalCount:
        typeof data?.totalCount === 'number'
          ? data.totalCount
          : Array.isArray(data?.items)
            ? data.items.length
            : 0,
    };
  },

  getWishlistedTourIds: async (): Promise<string[]> => {
    const response = await Api.get('/wishlists/ids');
    return normalizeTourIds(response.data);
  },

  toggleWishlist: async (tourId: string): Promise<ToggleWishlistResponse> => {
    const response = await Api.post('/wishlists/toggle', { tourId });
    return unwrapData<ToggleWishlistResponse>(response.data, {
      isAdded: false,
    });
  },
};
