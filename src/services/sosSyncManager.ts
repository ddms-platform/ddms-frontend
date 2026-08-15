import api from '@/services/api';
import { sosOfflineQueue } from './sosOfflineQueue';
import type { QueuedSosItem, SosAlert } from '@/interfaces/sos';
import { toast } from 'sonner';
import i18n from '@/i18n';

type SyncSuccessCallback = (alert: SosAlert, queuedItem: QueuedSosItem) => void;
type SyncErrorCallback = (error: any, queuedItem: QueuedSosItem) => void;

class SosSyncManager {
  private isProcessing = false;
  private retryTimer: ReturnType<typeof setInterval> | null = null;
  private successCallbacks: Set<SyncSuccessCallback> = new Set();
  private errorCallbacks: Set<SyncErrorCallback> = new Set();
  private isInitialized = false;

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Listen to network change events
    window.addEventListener('online', () => {
      console.log('🌐 Internet reconnected, attempting SOS sync...');
      this.processQueue();
    });

    window.addEventListener('focus', () => {
      if (sosOfflineQueue.getPendingCount() > 0) {
        this.processQueue();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (
        document.visibilityState === 'visible' &&
        sosOfflineQueue.getPendingCount() > 0
      ) {
        this.processQueue();
      }
    });

    // Start background polling timer for auto-retry
    this.startRetryTimer();

    // Check if there are existing items on load
    if (sosOfflineQueue.getPendingCount() > 0) {
      this.processQueue();
    }
  }

  private startRetryTimer() {
    if (this.retryTimer) return;
    // Check every 15 seconds if there are pending alerts
    this.retryTimer = setInterval(() => {
      if (sosOfflineQueue.getPendingCount() > 0 && navigator.onLine) {
        this.processQueue();
      }
    }, 15000);
  }

  public async processQueue(): Promise<void> {
    if (this.isProcessing) return;

    const queue = sosOfflineQueue.getQueue();
    const pendingItems = queue.filter(
      (item) => item.status === 'QUEUED' || item.status === 'FAILED',
    );

    if (pendingItems.length === 0) return;

    this.isProcessing = true;

    for (const item of pendingItems) {
      try {
        sosOfflineQueue.updateItem(item.id, {
          status: 'SENDING',
          attempts: item.attempts + 1,
        });

        const res = await api.post('/Sos/trigger', item.payload, {
          timeout: 10000,
        });
        const alertData: SosAlert = res.data.result;

        // Successfully synced to server
        sosOfflineQueue.removeFromQueue(item.id);

        toast.success(
          i18n.t(
            'sos.offline.syncSuccess',
            'Đã kết nối lại mạng! Tín hiệu SOS khẩn cấp đã được gửi thành công đến Cảng vụ.',
          ),
          {
            duration: 8000,
            id: `sos-sync-${item.id}`,
          },
        );

        this.notifySuccess(alertData, item);
      } catch (err: any) {
        console.warn(`Failed to sync queued SOS item ${item.id}:`, err);
        sosOfflineQueue.updateItem(item.id, {
          status: 'FAILED',
          lastError: err?.message || 'Network error',
        });
        this.notifyError(err, item);
        // If network error, stop processing rest of queue for now
        break;
      }
    }

    this.isProcessing = false;
  }

  public onSyncSuccess(callback: SyncSuccessCallback): () => void {
    this.successCallbacks.add(callback);
    return () => {
      this.successCallbacks.delete(callback);
    };
  }

  public onSyncError(callback: SyncErrorCallback): () => void {
    this.errorCallbacks.add(callback);
    return () => {
      this.errorCallbacks.delete(callback);
    };
  }

  private notifySuccess(alert: SosAlert, queuedItem: QueuedSosItem) {
    this.successCallbacks.forEach((cb) => {
      try {
        cb(alert, queuedItem);
      } catch (e) {
        console.error('Error in SOS sync success callback:', e);
      }
    });
  }

  private notifyError(err: any, queuedItem: QueuedSosItem) {
    this.errorCallbacks.forEach((cb) => {
      try {
        cb(err, queuedItem);
      } catch (e) {
        console.error('Error in SOS sync error callback:', e);
      }
    });
  }
}

export const sosSyncManager = new SosSyncManager();
