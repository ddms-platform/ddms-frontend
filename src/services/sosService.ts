import api from '@/services/api';
import type {
  TriggerSosPayload,
  SosAlert,
  QueuedSosItem,
} from '@/interfaces/sos';
import { sosOfflineQueue } from './sosOfflineQueue';
import { sosSyncManager } from './sosSyncManager';

export type { TriggerSosPayload, SosAlert, QueuedSosItem };
export { sosOfflineQueue, sosSyncManager };

export const sosService = {
  triggerSos: async (payload: TriggerSosPayload): Promise<SosAlert> => {
    // If browser reports offline right away, save to queue directly
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      sosOfflineQueue.addToQueue(payload);
      throw new Error('OFFLINE_SAVED');
    }

    try {
      const res = await api.post('/Sos/trigger', payload, {
        timeout: 8000,
      });
      return res.data.result;
    } catch (err: any) {
      // If network failure / timeout, automatically queue for offline sync
      const isNetworkError =
        !err.response ||
        err.code === 'ERR_NETWORK' ||
        err.code === 'ECONNABORTED' ||
        err.message?.includes('timeout') ||
        err.message?.includes('Network Error');

      if (isNetworkError) {
        sosOfflineQueue.addToQueue(payload);
        throw new Error('OFFLINE_SAVED');
      }

      throw err;
    }
  },

  getActiveAlerts: async (): Promise<SosAlert[]> => {
    const res = await api.get('/Sos/active');
    return res.data.result || [];
  },

  resolveSos: async (id: string, note?: string): Promise<SosAlert> => {
    const res = await api.put(`/Sos/${id}/resolve`, { note });
    return res.data.result;
  },
};
