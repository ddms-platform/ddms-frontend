import api from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BoatImage {
  id: string;
  boatId: string;
  imageUrl: string;
  publicId?: string;
  caption?: string;
  sortOrder: number;
}

export interface BoatMaintenance {
  id: string;
  boatId: string;
  startTime: string;
  endTime: string;
  reason?: string;
  createdAt: string;
}

export interface BoatCabin {
  id: string;
  boatId: string;
  name: string;
  capacity: number;
  price: number;
  totalRooms: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoatService {
  id: string;
  boatId: string;
  name: string;
  price: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Boat {
  id: string;
  name: string;
  type?: string;
  maxPassengers: number;
  status: 'idle' | 'running';
  createdAt: string;
  updatedAt: string;
  cabins: BoatCabin[];
  services: BoatService[];
  images: BoatImage[];
  maintenances: BoatMaintenance[];
  totalCabins: number;
  totalServices: number;
  activeServices: number;
}

export interface BoatListResponse {
  data: Boat[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateBoatDto {
  name: string;
  type?: string;
  maxPassengers: number;
  status?: string;
}

export interface CreateMaintenanceDto {
  startTime: string;
  endTime: string;
  reason?: string;
}

// ── API Functions ─────────────────────────────────────────────────────────────

export const boatService = {
  getAll: (params?: {
    status?: string;
    type?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) => api.get<BoatListResponse>('/boats', { params }).then((r) => r.data),

  getById: (id: string) => api.get<Boat>(`/boats/${id}`).then((r) => r.data),

  create: (dto: CreateBoatDto) => api.post<Boat>('/boats', dto).then((r) => r.data),

  update: (id: string, dto: CreateBoatDto) =>
    api.put<Boat>(`/boats/${id}`, dto).then((r) => r.data),

  updateStatus: (id: string, status: string) =>
    api.patch(`/boats/${id}/status`, { status }).then((r) => r.data),

  delete: (id: string) => api.delete(`/boats/${id}`).then((r) => r.data),

  addMaintenance: (boatId: string, dto: CreateMaintenanceDto) =>
    api.post<BoatMaintenance>(`/boats/${boatId}/maintenances`, dto).then((r) => r.data),

  deleteMaintenance: (boatId: string, maintenanceId: string) =>
    api.delete(`/boats/${boatId}/maintenances/${maintenanceId}`).then((r) => r.data),
};
