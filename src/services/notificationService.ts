import type { NotificationResponse } from '@/interfaces/notification';
import api from './api';

class NotificationService {
  public async getNotifications(limit = 20): Promise<NotificationResponse[]> {
    const response = await api.get<NotificationResponse[]>(
      `/notifications?limit=${limit}`,
    );
    return response.data;
  }

  public async markAsRead(id: string): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  }

  public async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all');
  }
}

export const notificationService = new NotificationService();
