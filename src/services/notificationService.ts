import type { NotificationResponse } from '@/interfaces/notification';
import { Api } from './axios';

const unwrapNotifications = (data: any): NotificationResponse[] => {
  const raw = data?.result ?? data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.items)) return raw.items;
  return [];
};

class NotificationService {
  public async getNotifications(limit = 20): Promise<NotificationResponse[]> {
    const response = await Api.get(`/notifications?limit=${limit}`);
    if (response.status === 401 || response.status === 403) return [];
    return unwrapNotifications(response.data);
  }

  public async markAsRead(id: string): Promise<void> {
    await Api.put(`/notifications/${id}/read`);
  }

  public async markAllAsRead(): Promise<void> {
    await Api.put('/notifications/read-all');
  }
}

export const notificationService = new NotificationService();
