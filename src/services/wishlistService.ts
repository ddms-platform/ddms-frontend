import { Api } from './axios';
import type { TourSearchItemResponse } from './tourService';

export interface WishlistResponse {
  items: TourSearchItemResponse[];
  totalCount: number;
}

export interface ToggleWishlistResponse {
  isAdded: boolean;
}

export const wishlistService = {
  getWishlists: async (): Promise<WishlistResponse> => {
    const response = await Api.get<WishlistResponse>('/wishlists');
    if (response.status !== 200 || !response.data?.items) {
      return { items: [], totalCount: 0 };
    }
    return response.data;
  },

  getWishlistedTourIds: async (): Promise<string[]> => {
    const response = await Api.get<string[]>('/wishlists/ids');
    if (response.status !== 200 || !Array.isArray(response.data)) {
      return [];
    }
    return response.data;
  },

  toggleWishlist: async (tourId: string): Promise<ToggleWishlistResponse> => {
    const response = await Api.post<ToggleWishlistResponse>(
      '/wishlists/toggle',
      {
        tourId,
      },
    );
    if (response.status !== 200 || !response.data) {
      throw new Error('Failed to toggle wishlist');
    }
    return response.data;
  },
};
