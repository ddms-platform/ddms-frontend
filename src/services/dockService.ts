import api from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DockSchedule {
  id: string;
  dockId: string;
  boatId: string;
  boatName?: string;
  scheduleId?: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface Dock {
  id: string;
  name: string;
  location?: string;
  maxBoats: number;
  createdAt: string;
  updatedAt: string;
  currentBoats: number;
  schedules: DockSchedule[];
}

export interface DockListResponse {
  data: Dock[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateDockDto {
  name: string;
  location?: string;
  maxBoats: number;
}

export interface CreateDockScheduleDto {
  boatId: string;
  startTime: string;
  endTime: string;
  scheduleId?: string;
}

// ── API Functions ─────────────────────────────────────────────────────────────

export const dockService = {
  getAll: (params?: { search?: string; page?: number; pageSize?: number }) =>
    api.get<DockListResponse>('/docks', { params }).then((r) => r.data),

  getById: (id: string) => api.get<Dock>(`/docks/${id}`).then((r) => r.data),

  create: (dto: CreateDockDto) => api.post<Dock>('/docks', dto).then((r) => r.data),

  update: (id: string, dto: CreateDockDto) =>
    api.put<Dock>(`/docks/${id}`, dto).then((r) => r.data),

  delete: (id: string) => api.delete(`/docks/${id}`).then((r) => r.data),

  getSchedules: (dockId: string) =>
    api.get<DockSchedule[]>(`/docks/${dockId}/schedules`).then((r) => r.data),

  addSchedule: (dockId: string, dto: CreateDockScheduleDto) =>
    api.post<DockSchedule>(`/docks/${dockId}/schedules`, dto).then((r) => r.data),

  deleteSchedule: (dockId: string, scheduleId: string) =>
    api.delete(`/docks/${dockId}/schedules/${scheduleId}`).then((r) => r.data),
};
