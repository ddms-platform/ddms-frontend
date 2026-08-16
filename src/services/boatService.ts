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
  portMaintenanceServiceId?: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  portMaintenanceServiceName?: string;
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

export interface ServiceRouteItem {
  id: string;
  name: string;
  startPoint?: string;
  endPoint?: string;
  description?: string;
}

export interface ServiceFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface ServiceRoomItem {
  id: string;
  name: string;
  capacity: number;
  price: number;
  description?: string;
  imageUrl?: string;
}

export interface ServiceComboItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

export interface BoatServiceItem {
  id: string;
  boatId: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
  serviceType?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  routes?: ServiceRouteItem[];
  faqs?: ServiceFaqItem[];
  rooms?: ServiceRoomItem[];
  combos?: ServiceComboItem[];
}

export interface Boat {
  id: string;
  name: string;
  type?: string;
  maxPassengers: number;
  status: 'idle' | 'running' | string;
  createdAt: string;
  updatedAt: string;
  cabins: BoatCabin[];
  services: BoatServiceItem[];
  images: BoatImage[];
  maintenances: BoatMaintenance[];
}

export interface BoatListItem {
  id: string;
  ownerId?: string;
  name: string;
  type?: string;
  maxPassengers: number;
  status: 'idle' | 'running' | string;
  complianceStatus?: 'valid' | 'warning' | 'hidden' | 'locked' | string;
  cabinCount: number;
  serviceCount: number;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResponse<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  code: number;
  result: T;
  message?: string;
  isSuccess: boolean;
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

export interface MonthlyProfit {
  month: string;
  profit: number;
  year: number;
}

export interface BoatStatsResponse {
  total: number;
  running: number;
  idle: number;
  totalCabins: number;
  totalServices?: number;
  monthlyProfits?: MonthlyProfit[];
}

export interface MaintenanceService {
  id: string;
  name: string;
  iconCode: string;
  price: number | null;
  description: string | null;
}

// ── API Functions ─────────────────────────────────────────────────────────────

export const boatService = {
  // --- Public Endpoints ---
  getAllPublic: (params?: {
    status?: string;
    type?: string;
    search?: string;
    pageNumber?: number;
    pageSize?: number;
  }) =>
    api
      .get<ApiResponse<PagedResponse<BoatListItem>>>('/boats', { params })
      .then((r) => r.data.result),

  getByIdPublic: (id: string) =>
    api.get<ApiResponse<Boat>>(`/boats/${id}`).then((r) => r.data.result),

  // --- Owner Endpoints ---
  getOwnerBoats: (params?: {
    status?: string;
    type?: string;
    search?: string;
    pageNumber?: number;
    pageSize?: number;
  }) =>
    api
      .get<ApiResponse<PagedResponse<BoatListItem>>>('/owner/boats', { params })
      .then((r) => r.data.result),

  getOwnerStats: () =>
    api
      .get<ApiResponse<BoatStatsResponse>>('/owner/boats/stats')
      .then((r) => r.data.result),

  getOwnerBoatById: (id: string) =>
    api.get<ApiResponse<Boat>>(`/owner/boats/${id}`).then((r) => r.data.result),

  uploadBoatImage: (boatId: string, base64: string, caption?: string) =>
    api
      .post<ApiResponse<any>>(`/owner/boats/${boatId}/images`, {
        fileBase64: base64,
        caption,
      })
      .then((r) => r.data.result),

  deleteBoatImage: (boatId: string, imageId: string) =>
    api
      .delete<ApiResponse<any>>(`/owner/boats/${boatId}/images/${imageId}`)
      .then((r) => r.data.result),

  createByOwner: (dto: CreateBoatDto) =>
    api.post<ApiResponse<Boat>>('/owner/boats', dto).then((r) => r.data.result),

  updateByOwner: (id: string, dto: CreateBoatDto) =>
    api
      .put<ApiResponse<Boat>>(`/owner/boats/${id}`, dto)
      .then((r) => r.data.result),

  deleteByOwner: (id: string) =>
    api
      .delete<ApiResponse<any>>(`/owner/boats/${id}`)
      .then((r) => r.data.result),

  deleteServiceByOwner: (boatId: string, serviceId: string) =>
    api
      .delete<ApiResponse<any>>(`/owner/boats/${boatId}/services/${serviceId}`)
      .then((r) => r.data.result),

  // --- Admin/Owner Management Endpoints (Cabins, Services, Images, Maintenance) ---
  // Currently backend maps these as /api/admin/boats/... but we will use them here.
  addMaintenance: (boatId: string, dto: CreateMaintenanceDto) =>
    api
      .post<
        ApiResponse<BoatMaintenance>
      >(`/admin/boats/${boatId}/maintenances`, dto)
      .then((r) => r.data.result),

  deleteMaintenance: (boatId: string, maintenanceId: string) =>
    api
      .delete<
        ApiResponse<any>
      >(`/admin/boats/${boatId}/maintenances/${maintenanceId}`)
      .then((r) => r.data.result),

  registerPortMaintenances: (
    boatId: string,
    registrations: { serviceId: string; scheduledDate: string }[],
  ) =>
    api
      .post<
        ApiResponse<any>
      >(`/owner/boats/${boatId}/maintenances/register`, registrations)
      .then((r) => r.data.result),

  deleteOwnerMaintenance: (boatId: string, maintenanceId: string) =>
    api
      .delete<
        ApiResponse<any>
      >(`/owner/boats/${boatId}/maintenances/${maintenanceId}`)
      .then((r) => r.data.result),

  getPendingMaintenancesAdmin: () =>
    api
      .get<ApiResponse<any[]>>('/admin/maintenances/pending')
      .then((r) => r.data.result),

  approveMaintenanceAdmin: (id: string) =>
    api
      .post<ApiResponse<any>>(`/admin/maintenances/${id}/approve`)
      .then((r) => r.data.result),

  rejectMaintenanceAdmin: (id: string) =>
    api
      .post<ApiResponse<any>>(`/admin/maintenances/${id}/reject`)
      .then((r) => r.data.result),

  getOwnerMaintenanceServices: () =>
    api
      .get<ApiResponse<MaintenanceService[]>>('/owner/maintenance-services')
      .then((r) => r.data.result),
};
