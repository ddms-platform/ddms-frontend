import api from './api';

export interface AiRecommendedTour {
  id: string;
  title: string;
  price: number;
  duration?: string;
  imageUrl?: string;
  departureLocation?: string;
}

export interface AiChatResponse {
  conversationId: string;
  reply: string;
  recommendedTours: AiRecommendedTour[];
}

export interface AiMessage {
  id: string;
  senderRole: 'user' | 'model' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AiConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export const aiService = {
  async sendMessage(
    message: string,
    conversationId?: string,
  ): Promise<AiChatResponse> {
    const res = await api.post<AiChatResponse>('/Ai/chat', {
      message,
      conversationId: conversationId || null,
    });
    return res.data;
  },

  async getConversations(): Promise<AiConversation[]> {
    const res = await api.get<AiConversation[]>('/Ai/conversations');
    return res.data;
  },

  async getMessages(conversationId: string): Promise<AiMessage[]> {
    const res = await api.get<AiMessage[]>(
      `/Ai/conversations/${conversationId}/messages`,
    );
    return res.data;
  },

  async deleteConversation(conversationId: string): Promise<void> {
    await api.delete(`/Ai/conversations/${conversationId}`);
  },
};

export default aiService;
