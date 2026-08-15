import api from './api';

export interface AiRecommendedTour {
  id: string;
  title: string;
  price: number;
  duration?: string;
  imageUrl?: string;
  departureLocation?: string;
  avgRating?: number;
  totalReviews?: number;
  nextDeparture?: string;
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

export type OwnerContentType =
  | 'name'
  | 'vessel_name'
  | 'description'
  | 'faqs'
  | 'price';

export interface OwnerContentRequest {
  type: OwnerContentType;
  keywords: string;
  tourName?: string;
  description?: string;
  serviceType?: string;
  durationMinutes?: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface OwnerContentResponse {
  type: OwnerContentType;
  text?: string;
  options?: string[];
  faqs?: FaqItem[];
  suggestedPrice?: number;
}

export interface AiStreamChunk {
  type: 'chunk' | 'done' | 'error';
  delta?: string;
  conversationId?: string;
  recommendedTours?: AiRecommendedTour[];
  error?: string;
}

export async function streamAiChat(
  message: string,
  conversationId: string | undefined,
  onChunk: (chunk: AiStreamChunk) => void,
  signal?: AbortSignal,
): Promise<void> {
  const baseUrl =
    (import.meta as unknown as { env: { VITE_API_URL?: string } }).env
      .VITE_API_URL || 'https://localhost:7161';
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${baseUrl}/api/Ai/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, conversationId: conversationId || null }),
    signal,
  });
  if (!res.ok || !res.body) {
    throw new Error(`Stream failed: ${res.status}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload) continue;
      try {
        const chunk = JSON.parse(payload) as AiStreamChunk;
        onChunk(chunk);
      } catch (err) {
        console.warn('Bad SSE payload', payload, err);
      }
    }
  }
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

  async generateOwnerContent(
    payload: OwnerContentRequest,
  ): Promise<OwnerContentResponse> {
    const res = await api.post<OwnerContentResponse>(
      '/Ai/owner/generate-content',
      payload,
    );
    return res.data;
  },
};

export default aiService;
