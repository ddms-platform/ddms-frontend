import * as signalR from '@microsoft/signalr';
import type { BlogPostListItem } from './blogService';

const HUB_URL = `${import.meta.env.VITE_API_URL || 'https://localhost:7161'}/hub/blog`;

type Subscriber = (post: BlogPostListItem) => void;

/**
 * Nhận bài viết mới ngay khi worker cào tin đưa lên trang.
 *
 * Dùng đếm người đăng ký thay vì một kết nối cho mỗi component: trang chủ và
 * trang tin tức có thể cùng lắng nghe, người rời đi sau cùng mới đóng kết nối.
 * Đây đúng là lỗi đã làm hỏng inbox trước đây — hai consumer ghi đè handler
 * của nhau rồi một bên gọi stop làm bên kia mất tin.
 */
class BlogSignalRService {
  private connection: signalR.HubConnection | null = null;
  private starting: Promise<void> | null = null;
  private subscribers = new Set<Subscriber>();

  public subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn);
    void this.ensureConnection();

    return () => {
      this.subscribers.delete(fn);
      if (this.subscribers.size === 0) void this.stop();
    };
  }

  private async ensureConnection(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) return;
    if (this.starting) return this.starting;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('NewPost', (post: BlogPostListItem) => {
      this.subscribers.forEach((fn) => fn(post));
    });

    this.connection = connection;
    this.starting = connection
      .start()
      .catch((error) => {
        // Mất realtime thì trang vẫn dùng được, chỉ là phải tải lại mới thấy bài mới.
        console.warn('Không kết nối được hub tin tức:', error);
      })
      .finally(() => {
        this.starting = null;
      });

    return this.starting;
  }

  private async stop(): Promise<void> {
    const connection = this.connection;
    this.connection = null;
    if (!connection) return;
    try {
      await connection.stop();
    } catch {
      /* đang đóng rồi thì thôi */
    }
  }
}

export const blogSignalRService = new BlogSignalRService();
