export interface ConversationResponse {
  id: string;
  type: string;
  bookingId?: string;
  bookingCode?: string;
  tourName?: string;
  partnerName: string;
  partnerAvatar?: string;
  partnerId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  body: string;
  createdAt: string;
}

export interface StartConversationRequest {
  bookingId: string;
}

export interface SendMessageRequest {
  body: string;
}
