import api from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DockSchedule {
  id: string;
  dockId: string;
  boatId: string;
  boatName?: string;
  scheduleId?: string;
  /** Khoang neo cảng vụ đã gán, ví dụ "A12". Rỗng khi chưa gán. */
  berthCode?: string | null;
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
    api.get<any>('/docks', { params }).then((r) => {
      const resData = r.data;
      if (resData && resData.result) {
        return {
          data: resData.result.items || [],
          total: resData.result.totalItems || 0,
          page: resData.result.page || 1,
          pageSize: resData.result.pageSize || 10,
        };
      }
      return resData;
    }),

  getById: (id: string) =>
    api.get<any>(`/docks/${id}`).then((r) => r.data.result || r.data),

  create: (dto: CreateDockDto) =>
    api.post<any>('/docks', dto).then((r) => r.data.result || r.data),

  update: (id: string, dto: CreateDockDto) =>
    api.put<any>(`/docks/${id}`, dto).then((r) => r.data.result || r.data),

  delete: (id: string) =>
    api.delete<any>(`/docks/${id}`).then((r) => r.data.result || r.data),

  getSchedules: (dockId: string) =>
    api
      .get<any>(`/docks/${dockId}/schedules`)
      .then((r) => r.data.result || r.data),

  addSchedule: (dockId: string, dto: CreateDockScheduleDto) =>
    api
      .post<any>(`/docks/${dockId}/schedules`, dto)
      .then((r) => r.data.result || r.data),

  deleteSchedule: (dockId: string, scheduleId: string) =>
    api
      .delete<any>(`/docks/${dockId}/schedules/${scheduleId}`)
      .then((r) => r.data.result || r.data),
};
