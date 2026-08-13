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
  attachmentUrl?: string;
  attachmentType?: 'image' | 'video' | string;
  attachmentName?: string;
  createdAt: string;
}

export interface StartConversationRequest {
  bookingId: string;
}

export interface SendMessageRequest {
  body?: string;
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
}

export interface ChatAttachmentResponse {
  url: string;
  type: 'image' | 'video' | string;
  name: string;
}
