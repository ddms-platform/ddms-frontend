import api from './api';
import type { BoatService } from './boatService';

export interface CreateServiceDto {
  name: string;
  price: number;
  description?: string;
  isActive: boolean;
}

export const boatServiceApi = {
  getAll: (boatId: string, isActive?: boolean) =>
    api
      .get<BoatService[]>(`/boats/${boatId}/services`, {
        params: isActive !== undefined ? { isActive } : undefined,
      })
      .then((r) => r.data),

  getById: (boatId: string, id: string) =>
    api.get<BoatService>(`/boats/${boatId}/services/${id}`).then((r) => r.data),

  create: (boatId: string, dto: CreateServiceDto) =>
    api.post<BoatService>(`/boats/${boatId}/services`, dto).then((r) => r.data),

  update: (boatId: string, id: string, dto: CreateServiceDto) =>
    api.put<BoatService>(`/boats/${boatId}/services/${id}`, dto).then((r) => r.data),

  toggle: (boatId: string, id: string) =>
    api
      .patch<{ id: string; isActive: boolean }>(`/boats/${boatId}/services/${id}/toggle`)
      .then((r) => r.data),

  delete: (boatId: string, id: string) =>
    api.delete(`/boats/${boatId}/services/${id}`).then((r) => r.data),
};
