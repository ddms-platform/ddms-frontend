import * as signalR from '@microsoft/signalr';
import type { MessageResponse } from '@/interfaces/chat';

class ChatSignalRService {
  private connection: signalR.HubConnection | null = null;

  public startConnection(
    onMessageReceived: (msg: MessageResponse) => void,
  ): Promise<void> {
    if (this.connection) {
      // Re-register message callback in case it changes
      this.connection.off('ReceiveMessage');
      this.connection.on('ReceiveMessage', onMessageReceived);
      return Promise.resolve();
    }

    const baseUrl = import.meta.env.VITE_API_URL || 'https://localhost:7161';
    const hubUrl = `${baseUrl}/hub/chat`;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => localStorage.getItem('access_token') || '',
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('ReceiveMessage', (message: MessageResponse) => {
      onMessageReceived(message);
    });

    return this.connection
      .start()
      .then(() => {
        console.log('SignalR Hub connected successfully to /hub/chat');
      })
      .catch((err) => {
        console.error('SignalR Chat Connection Error: ', err);
        this.connection = null;
        throw err;
      });
  }

  public stopConnection(): Promise<void> {
    if (!this.connection) {
      return Promise.resolve();
    }

    return this.connection
      .stop()
      .then(() => {
        console.log('SignalR Chat Connection stopped');
        this.connection = null;
      })
      .catch((err) => {
        console.error('SignalR Chat Disconnection Error: ', err);
      });
  }
}

export const chatSignalRService = new ChatSignalRService();
