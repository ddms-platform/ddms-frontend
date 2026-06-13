import api from './api';
import type {
  BoatServiceItem as BoatService,
  ApiResponse,
} from './boatService';

export interface CreateServiceDto {
  name: string;
  price: number;
  description?: string;
  isActive: boolean;
}

export const boatServiceApi = {
  getAll: (boatId: string, isActive?: boolean) =>
    api
      .get<ApiResponse<BoatService[]>>(`/admin/boats/${boatId}/services`, {
        params: isActive !== undefined ? { isActive } : undefined,
      })
      .then((r) => r.data.result),

  getById: (boatId: string, id: string) =>
    api
      .get<ApiResponse<BoatService>>(`/admin/boats/${boatId}/services/${id}`)
      .then((r) => r.data.result),

  create: (boatId: string, dto: CreateServiceDto) =>
    api
      .post<ApiResponse<BoatService>>(`/admin/boats/${boatId}/services`, dto)
      .then((r) => r.data.result),

  update: (boatId: string, id: string, dto: CreateServiceDto) =>
    api
      .put<
        ApiResponse<BoatService>
      >(`/admin/boats/${boatId}/services/${id}`, dto)
      .then((r) => r.data.result),

  toggle: (boatId: string, id: string) =>
    api
      .patch<
        ApiResponse<BoatService>
      >(`/admin/boats/${boatId}/services/${id}/toggle`)
      .then((r) => r.data.result),

  delete: (boatId: string, id: string) =>
    api
      .delete<ApiResponse<any>>(`/admin/boats/${boatId}/services/${id}`)
      .then((r) => r.data.result),
};
