import api from './api';
import type { ConversationResponse, MessageResponse } from '@/interfaces/chat';

export interface ApiResponse<T> {
  code: number;
  result: T;
  message?: string;
}

export const chatService = {
  getConversations: () =>
    api
      .get<ApiResponse<ConversationResponse[]>>('/chat/conversations')
      .then((r) => r.data.result),

  getMessages: (conversationId: string, limit = 50, before?: string) => {
    let url = `/chat/conversations/${conversationId}/messages?limit=${limit}`;
    if (before) {
      url += `&before=${encodeURIComponent(before)}`;
    }
    return api
      .get<ApiResponse<MessageResponse[]>>(url)
      .then((r) => r.data.result);
  },

  startConversation: (bookingId: string) =>
    api
      .post<
        ApiResponse<ConversationResponse>
      >('/chat/conversations', { bookingId })
      .then((r) => r.data.result),

  sendMessage: (conversationId: string, body: string) =>
    api
      .post<
        ApiResponse<MessageResponse>
      >(`/chat/conversations/${conversationId}/messages`, { body })
      .then((r) => r.data.result),

  markAsRead: (conversationId: string) =>
    api
      .post<ApiResponse<string>>(`/chat/conversations/${conversationId}/read`)
      .then((r) => r.data.result),
};
