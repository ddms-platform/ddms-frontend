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
    const response = await Api.get('/wishlists');
    return response.data;
  },

  getWishlistedTourIds: async (): Promise<string[]> => {
    const response = await Api.get('/wishlists/ids');
    return response.data || [];
  },

  toggleWishlist: async (tourId: string): Promise<ToggleWishlistResponse> => {
    const response = await Api.post('/wishlists/toggle', { tourId });
    return response.data;
  },
};
