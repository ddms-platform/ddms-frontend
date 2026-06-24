import api from './api';
import type { BoatCabin, ApiResponse } from './boatService';

export interface CreateCabinDto {
  name: string;
  capacity: number;
  price: number;
  totalRooms: number;
  description?: string;
}

export const cabinService = {
  getAll: (boatId: string) =>
    api
      .get<ApiResponse<BoatCabin[]>>(`/admin/boats/${boatId}/cabins`)
      .then((r) => r.data.result),

  getById: (boatId: string, id: string) =>
    api
      .get<ApiResponse<BoatCabin>>(`/admin/boats/${boatId}/cabins/${id}`)
      .then((r) => r.data.result),

  create: (boatId: string, dto: CreateCabinDto) =>
    api
      .post<ApiResponse<BoatCabin>>(`/admin/boats/${boatId}/cabins`, dto)
      .then((r) => r.data.result),

  update: (boatId: string, id: string, dto: CreateCabinDto) =>
    api
      .put<ApiResponse<BoatCabin>>(`/admin/boats/${boatId}/cabins/${id}`, dto)
      .then((r) => r.data.result),

  delete: (boatId: string, id: string) =>
    api
      .delete<ApiResponse<any>>(`/admin/boats/${boatId}/cabins/${id}`)
      .then((r) => r.data.result),
};
