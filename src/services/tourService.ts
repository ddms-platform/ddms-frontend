import api from './api';
import type { ApiResponse, PagedResponse } from './boatService';

export interface AvailableSlotResponse {
  scheduleId: string;
  startTime: string;
  endTime: string;
  maxCapacity: number | null;
  bookedCapacity: number;
  remainingCapacity: number | null;
  boatId: string | null;
  boatName: string | null;
  dockId: string | null;
  dockName: string | null;
}

export interface PopularDestinationResponse {
  name: string;
  tours: number;
  imageUrl?: string;
}

export interface TourSearchItemResponse {
  id: string;
  name: string;
  price: number;
  description: string | null;
  durationMinutes: number;
  location: string | null;
  status: string;
  avgRating: number;
  totalReviews: number;
  cancelPolicy: string;
  cancelHours: number | null;
  imageUrl?: string;
  availableSlots: AvailableSlotResponse[];
}

export interface TourRouteResponse {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  description?: string;
}

export interface TourFaqResponse {
  id: string;
  question: string;
  answer: string;
}

export interface TourClassResponse {
  id: string;
  name: string;
  capacity: number;
  price: number;
  description?: string;
  imageUrl?: string;
}

export interface TourServiceResponse {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

export interface TourItemResponse {
  id: string;
  name: string;
  price: number;
  description?: string;
  durationMinutes: number;
  location?: string;
  mapUrl?: string;
  status: string;
  cancelPolicy: string;
  cancelHours?: number;
  avgRating: number;
  totalReviews: number;
  routes: TourRouteResponse[];
  faqs: TourFaqResponse[];
  classes: TourClassResponse[];
  services: TourServiceResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface TourImageItemResponse {
  id: string;
  tourId: string;
  imageUrl: string;
  publicId: string | null;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface FaqItemResponse {
  id: string;
  tourId: string;
  question: string;
  answer: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TourSearchQuery {
  page?: number;
  pageSize?: number;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  date?: string;
  status?: string;
  minDurationMinutes?: number;
  maxDurationMinutes?: number;
  sortBy?: string;
  sortOrder?: string;
}

export const tourService = {
  searchTours: (query?: TourSearchQuery) =>
    api
      .get<
        ApiResponse<PagedResponse<TourSearchItemResponse>>
      >('/tours/search', { params: query })
      .then((r) => r.data.result),

  getPopularDestinations: (limit: number = 3) =>
    api
      .get<
        ApiResponse<PopularDestinationResponse[]>
      >('/public/tours/destinations/popular', { params: { limit } })
      .then((r) => r.data.result),

  getPublicTourById: (tourId: string) =>
    api
      .get<ApiResponse<TourItemResponse>>(`/public/tours/${tourId}`)
      .then((r) => r.data.result),

  getTourImages: (tourId: string) =>
    api
      .get<
        ApiResponse<TourImageItemResponse[]>
      >(`/public/tours/${tourId}/images`)
      .then((r) => r.data.result),

  getTourFaqs: (tourId: string) =>
    api
      .get<ApiResponse<FaqItemResponse[]>>(`/public/tours/${tourId}/faqs`)
      .then((r) => r.data.result),

  getTourSchedules: (tourId: string) =>
    api
      .get<ApiResponse<any[]>>(`/tour-schedules/tour/${tourId}`)
      .then((r) => r.data.result),
};
