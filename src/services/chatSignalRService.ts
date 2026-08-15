import * as signalR from '@microsoft/signalr';
import type { MessageResponse } from '@/interfaces/chat';

export interface ChatSignalRSubscriber {
  onMessage?: (msg: MessageResponse) => void;
  onNotification?: (notif: any) => void;
}

/**
 * Mot connection dung chung cho ca trang inbox lan chuong thong bao tren header.
 *
 * Truoc day service nay chi giu duoc mot handler: moi lan co nguoi goi
 * startConnection() no lam `off('ReceiveMessage')` roi `on(...)` de len, nen
 * ai goi sau se xoa handler cua nguoi goi truoc. Chuong thong bao truyen
 * `() => {}` vao cho vi tri do, dan den tin nhan ve toi trinh duyet roi bi
 * vut di im lang. Ngoai ra moi consumer deu duoc phep goi stopConnection(),
 * nen mot trang unmount la dong socket cua tat ca cac trang con lai.
 *
 * Gio moi ben dang ky mot subscriber rieng, connection duoc dem tham chieu va
 * chi dong khi khong con ai dung.
 */
class ChatSignalRService {
  private connection: signalR.HubConnection | null = null;
  private starting: Promise<void> | null = null;
  private stopping: Promise<void> | null = null;
  private subscribers = new Set<ChatSignalRSubscriber>();

  /** Dang ky nhan su kien. Goi ham tra ve de huy dang ky khi unmount. */
  public subscribe(subscriber: ChatSignalRSubscriber): () => void {
    this.subscribers.add(subscriber);

    void this.ensureConnection().catch((err) => {
      console.error('SignalR Chat Connection Error: ', err);
    });

    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.subscribers.delete(subscriber);
      if (this.subscribers.size === 0) {
        void this.stopConnection();
      }
    };
  }

  private async ensureConnection(): Promise<void> {
    // Neu dang dong dang do thi doi dong xong roi mo lai tu dau
    if (this.stopping) {
      await this.stopping;
    }
    if (this.starting) {
      return this.starting;
    }
    if (this.connection) {
      return;
    }

    const baseUrl = import.meta.env.VITE_API_URL || 'https://localhost:7161';
    const hubUrl = `${baseUrl}/hub/chat`;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => localStorage.getItem('access_token') || '',
      })
      .withAutomaticReconnect()
      .build();

    // Phat cho tat ca subscriber - khong ai ghi de duoc handler cua ai
    connection.on('ReceiveMessage', (message: MessageResponse) => {
      this.subscribers.forEach((s) => s.onMessage?.(message));
    });

    connection.on('ReceiveNotification', (notification: any) => {
      this.subscribers.forEach((s) => s.onNotification?.(notification));
    });

    this.connection = connection;
    this.starting = connection
      .start()
      .then(() => {
        this.starting = null;
        console.log('SignalR Hub connected successfully to /hub/chat');
      })
      .catch((err) => {
        this.starting = null;
        if (this.connection === connection) {
          this.connection = null;
        }
        throw err;
      });

    return this.starting;
  }

  /** Dong connection. Thuong khong can goi truc tiep - huy dang ky la du. */
  public stopConnection(): Promise<void> {
    const connection = this.connection;
    if (!connection) {
      return this.stopping ?? Promise.resolve();
    }

    this.connection = null;
    const starting = this.starting;
    this.starting = null;

    this.stopping = (async () => {
      try {
        // Khong stop() khi start() con dang chay, neu khong se dinh race
        await starting?.catch(() => {});
        await connection.stop();
        console.log('SignalR Chat Connection stopped');
      } catch (err) {
        console.error('SignalR Chat Disconnection Error: ', err);
      } finally {
        this.stopping = null;
      }
    })();

    return this.stopping;
  }
}

export const chatSignalRService = new ChatSignalRService();
