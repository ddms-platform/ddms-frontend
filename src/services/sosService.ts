import api from '@/services/api';
import type { TriggerSosPayload, SosAlert } from '@/interfaces/sos';

export type { TriggerSosPayload, SosAlert };

export const sosService = {
  triggerSos: async (payload: TriggerSosPayload): Promise<SosAlert> => {
    const res = await api.post('/Sos/trigger', payload);
    return res.data.result;
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
