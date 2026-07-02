import { Axios } from './axios';

export interface ReviewDto {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  tourId: string;
  bookingId: string;
  rating: number;
  comment: string;
  imageUrls: string[];
  videoUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedReviewResult {
  reviews: ReviewDto[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

export const reviewService = {
  getReviewsByTourId: async (
    tourId: string,
    pageIndex = 1,
    pageSize = 5,
  ): Promise<PaginatedReviewResult> => {
    const response = await Axios.get(`/reviews/tour/${tourId}`, {
      params: { pageIndex, pageSize },
    });
    return response.data.data;
  },

  canReviewTour: async (
    tourId: string,
  ): Promise<{ canReview: boolean; bookingIds: string[] }> => {
    const response = await Axios.get(`/reviews/can-review/${tourId}`);
    return response.data;
  },

  createReview: async (formData: FormData): Promise<any> => {
    const response = await Axios.post('/reviews', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateReview: async (id: string, formData: FormData): Promise<any> => {
    const response = await Axios.put(`/reviews/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteReview: async (id: string): Promise<any> => {
    const response = await Axios.delete(`/reviews/${id}`);
    return response.data;
  },
};
