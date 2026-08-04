import type { AiRecommendedTour } from '@/services/aiService';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  recommendedTours?: AiRecommendedTour[];
  timestamp: Date;
}
