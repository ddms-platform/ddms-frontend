import type { TriggerSosPayload, QueuedSosItem } from '@/interfaces/sos';

const SOS_QUEUE_STORAGE_KEY = 'ddms_sos_offline_queue';

type QueueChangeListener = (queue: QueuedSosItem[]) => void;
const listeners: Set<QueueChangeListener> = new Set();

const notifyListeners = (queue: QueuedSosItem[]) => {
  listeners.forEach((listener) => {
    try {
      listener(queue);
    } catch (e) {
      console.error('Error notifying SOS queue listener:', e);
    }
  });
};

export const sosOfflineQueue = {
  getQueue: (): QueuedSosItem[] => {
    try {
      const raw = localStorage.getItem(SOS_QUEUE_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Failed to read SOS offline queue:', err);
      return [];
    }
  },

  saveQueue: (queue: QueuedSosItem[]): void => {
    try {
      localStorage.setItem(SOS_QUEUE_STORAGE_KEY, JSON.stringify(queue));
      notifyListeners(queue);
    } catch (err) {
      console.error('Failed to persist SOS offline queue:', err);
    }
  },

  addToQueue: (payload: TriggerSosPayload): QueuedSosItem => {
    const queue = sosOfflineQueue.getQueue();
    const newItem: QueuedSosItem = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `offline_sos_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      payload: {
        ...payload,
        note: payload.note
          ? `${payload.note} [Tạo ngoại tuyến lúc ${new Date().toLocaleTimeString('vi-VN')}]`
          : `[Tạo ngoại tuyến lúc ${new Date().toLocaleTimeString('vi-VN')}]`,
      },
      queuedAt: new Date().toISOString(),
      attempts: 0,
      status: 'QUEUED',
    };

    const updated = [newItem, ...queue];
    sosOfflineQueue.saveQueue(updated);
    return newItem;
  },

  updateItem: (id: string, updates: Partial<QueuedSosItem>): void => {
    const queue = sosOfflineQueue.getQueue();
    const index = queue.findIndex((item) => item.id === id);
    if (index !== -1) {
      queue[index] = { ...queue[index], ...updates };
      sosOfflineQueue.saveQueue(queue);
    }
  },

  removeFromQueue: (id: string): void => {
    const queue = sosOfflineQueue.getQueue();
    const updated = queue.filter((item) => item.id !== id);
    sosOfflineQueue.saveQueue(updated);
  },

  clearQueue: (): void => {
    sosOfflineQueue.saveQueue([]);
  },

  getPendingCount: (): number => {
    return sosOfflineQueue
      .getQueue()
      .filter((item) => item.status === 'QUEUED' || item.status === 'FAILED')
      .length;
  },

  getLatestPending: (): QueuedSosItem | null => {
    const queue = sosOfflineQueue.getQueue();
    return (
      queue.find(
        (item) => item.status === 'QUEUED' || item.status === 'FAILED',
      ) || null
    );
  },

  subscribe: (listener: QueueChangeListener): (() => void) => {
    listeners.add(listener);
    // Initial emission
    try {
      listener(sosOfflineQueue.getQueue());
    } catch (e) {
      console.error('Error on initial subscriber call:', e);
    }
    return () => {
      listeners.delete(listener);
    };
  },
};
