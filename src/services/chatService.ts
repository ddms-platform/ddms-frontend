import api from './api';
import type {
  ChatAttachmentResponse,
  ConversationResponse,
  MessageResponse,
  SendMessageRequest,
} from '@/interfaces/chat';

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

  sendMessage: (conversationId: string, payload: SendMessageRequest) =>
    api
      .post<
        ApiResponse<MessageResponse>
      >(`/chat/conversations/${conversationId}/messages`, payload)
      .then((r) => r.data.result),

  uploadAttachment: (conversationId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<ApiResponse<ChatAttachmentResponse>>(
        `/chat/conversations/${conversationId}/attachments`,
        form,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      )
      .then((r) => r.data.result);
  },

  markAsRead: (conversationId: string) =>
    api
      .post<ApiResponse<string>>(`/chat/conversations/${conversationId}/read`)
      .then((r) => r.data.result),
};
