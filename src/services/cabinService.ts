import api from './api';
import type { BoatCabin } from './boatService';

export interface CreateCabinDto {
  name: string;
  capacity: number;
  price: number;
  totalRooms: number;
  description?: string;
}

export const cabinService = {
  getAll: (boatId: string) => api.get<BoatCabin[]>(`/boats/${boatId}/cabins`).then((r) => r.data),

  getById: (boatId: string, id: string) =>
    api.get<BoatCabin>(`/boats/${boatId}/cabins/${id}`).then((r) => r.data),

  create: (boatId: string, dto: CreateCabinDto) =>
    api.post<BoatCabin>(`/boats/${boatId}/cabins`, dto).then((r) => r.data),

  update: (boatId: string, id: string, dto: CreateCabinDto) =>
    api.put<BoatCabin>(`/boats/${boatId}/cabins/${id}`, dto).then((r) => r.data),

  delete: (boatId: string, id: string) =>
    api.delete(`/boats/${boatId}/cabins/${id}`).then((r) => r.data),
};
