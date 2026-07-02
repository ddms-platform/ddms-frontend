import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Send,
  MessageSquare,
  Calendar,
  User as UserIcon,
  DollarSign,
  Inbox,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { chatService } from '@/services/chatService';
import { chatSignalRService } from '@/services/chatSignalRService';
import type { ConversationResponse, MessageResponse } from '@/interfaces/chat';
import { toast } from 'sonner';

export default function InboxPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<ConversationResponse[]>(
    [],
  );
  const [activeConversation, setActiveConversation] =
    useState<ConversationResponse | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // Helper to parse query params (e.g. ?conversationId=xxx)
  const queryParams = new URLSearchParams(location.search);
  const queryConversationId = queryParams.get('conversationId');

  // Load conversations
  const fetchConversations = async (autoSelectId?: string) => {
    try {
      const data = await chatService.getConversations();
      setConversations(data);

      // Handle selecting active conversation
      const targetId = autoSelectId || queryConversationId;
      if (targetId) {
        const found = data.find((c) => c.id === targetId);
        if (found) {
          setActiveConversation((prev) =>
            prev?.id === found.id ? prev : found,
          );
        }
      } else if (data.length > 0 && !activeConversation) {
        // By default do not select anything on mobile, or select first on desktop
        if (window.innerWidth > 768) {
          setActiveConversation(data[0]);
        }
      }
    } catch (e: any) {
      console.error('Failed to load conversations:', e);
      toast.error(
        t(
          'chat.errors.loadConversations',
          'Không thể tải danh sách cuộc hội thoại.',
        ),
      );
    } finally {
      setLoadingConvs(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryConversationId]);

  // Handle SignalR real-time messages
  useEffect(() => {
    chatSignalRService
      .startConnection((newMessage) => {
        // Append message if it's in the current active conversation
        if (
          activeConversation &&
          newMessage.conversationId === activeConversation.id
        ) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          // Mark read on backend
          chatService.markAsRead(newMessage.conversationId);
        }

        // Refresh conversations list to update previews
        fetchConversations(activeConversation?.id);
      })
      .catch((err) => {
        console.error('Error starting SignalR chat:', err);
      });

    return () => {
      chatSignalRService.stopConnection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.id]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversation?.id) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const data = await chatService.getMessages(activeConversation.id);
        setMessages(data);
        // Mark read
        await chatService.markAsRead(activeConversation.id);
        // Reset unread count locally
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id ? { ...c, unreadCount: 0 } : c,
          ),
        );
      } catch (e: any) {
        console.error('Failed to load messages:', e);
        toast.error(
          t('chat.errors.loadMessages', 'Không thể tải lịch sử tin nhắn.'),
        );
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeConversation?.id]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || !inputText.trim() || sending) return;

    const body = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const newMsg = await chatService.sendMessage(activeConversation.id, body);
      setMessages((prev) => [...prev, newMsg]);

      // Update last message in local conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? {
                ...c,
                lastMessage: body,
                lastMessageAt: new Date().toISOString(),
              }
            : c,
        ),
      );
    } catch (e: any) {
      console.error('Failed to send message:', e);
      toast.error(
        t(
          'chat.errors.sendMessage',
          'Không thể gửi tin nhắn. Vui lòng thử lại.',
        ),
      );
      setInputText(body); // Restore input on failure
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="flex flex-1 overflow-hidden"
      style={{
        height: 'calc(100vh - 80px)', // Adjust based on header height
        backgroundColor: '#0A192F',
      }}
    >
      <div className="container mx-auto px-4 py-4 flex flex-1 overflow-hidden">
        <div
          className="flex flex-1 rounded-2xl border overflow-hidden"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.08)',
            backgroundColor: '#112240',
          }}
        >
          {/* 1. Sidebar - Conversations List */}
          <div
            className={`w-full md:w-80 flex flex-col border-r overflow-hidden transition-all ${
              activeConversation ? 'hidden md:flex' : 'flex'
            }`}
            style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
          >
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#00F0FF]" />
                {t('chat.inboxTitle', 'Hộp thư tin nhắn')}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loadingConvs ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <Loader2 className="h-6 w-6 text-[#00F0FF] animate-spin" />
                  <span className="text-sm text-slate-400">
                    {t('chat.loadingConvs', 'Đang tải cuộc hội thoại...')}
                  </span>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <Inbox className="h-12 w-12 text-slate-500 mb-2" />
                  <p className="text-sm font-semibold text-slate-300">
                    {t('chat.noConversations', 'Không có cuộc trò chuyện nào')}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {t(
                      'chat.noConversationsDesc',
                      'Hãy liên hệ với chủ tàu từ trang chi tiết lịch trình của bạn.',
                    )}
                  </p>
                </div>
              ) : (
                conversations.map((c) => {
                  const isSelected = activeConversation?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveConversation(c);
                        // Clean up query param
                        if (queryConversationId) {
                          navigate('/inbox', { replace: true });
                        }
                      }}
                      className="w-full text-left p-3 rounded-xl flex items-center gap-3 hover:bg-[#1d2d50] transition-colors relative"
                      style={{
                        backgroundColor: isSelected ? '#1e293b' : 'transparent',
                      }}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {c.partnerAvatar ? (
                          <img
                            src={c.partnerAvatar}
                            alt={c.partnerName}
                            className="h-10 w-10 rounded-full object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-white border border-slate-700">
                            <UserIcon size={18} />
                          </div>
                        )}
                        {c.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#ff385c] rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-lg">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-200 truncate">
                            {c.partnerName}
                          </span>
                          {c.lastMessageAt && (
                            <span className="text-[10px] text-slate-400">
                              {new Date(c.lastMessageAt).toLocaleTimeString(
                                [],
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                },
                              )}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs truncate mt-0.5 ${c.unreadCount > 0 ? 'text-white font-bold' : 'text-slate-400'}`}
                        >
                          {c.lastMessage ||
                            t('chat.noMessagesYet', 'Chưa có tin nhắn')}
                        </p>
                        {c.tourName && (
                          <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-[#00F0FF] truncate max-w-full">
                            {t('chat.tourPrefix', 'Tour:')} {c.tourName}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 2. Main Pane - Active Chat Window */}
          <div
            className={`flex-1 flex flex-col overflow-hidden ${
              !activeConversation ? 'hidden md:flex' : 'flex'
            }`}
          >
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div
                  className="p-4 border-b flex items-center gap-3 bg-[#13284f]"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
                >
                  <button
                    onClick={() => setActiveConversation(null)}
                    className="md:hidden p-1 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  {activeConversation.partnerAvatar ? (
                    <img
                      src={activeConversation.partnerAvatar}
                      alt={activeConversation.partnerName}
                      className="h-9 w-9 rounded-full object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-white border border-slate-700">
                      <UserIcon size={16} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">
                      {activeConversation.partnerName}
                    </h3>
                    <p className="text-[11px] text-[#00F0FF] truncate">
                      {activeConversation.bookingCode
                        ? `${t('chat.bookingPrefix', 'Đơn đặt:')} #${activeConversation.bookingCode}`
                        : t('chat.chatDefaultTitle', 'Trò chuyện')}
                    </p>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a152b]">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 text-[#00F0FF] animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
                      <MessageSquare className="h-10 w-10 text-slate-600 mb-2" />
                      <p className="text-sm">
                        {t(
                          'chat.firstMessagePrompt',
                          'Hãy gửi tin nhắn đầu tiên để bắt đầu trò chuyện',
                        )}
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div
                          key={msg.id || index}
                          className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isMe && (
                            <div className="shrink-0">
                              {msg.senderAvatar ? (
                                <img
                                  src={msg.senderAvatar}
                                  alt={msg.senderName}
                                  className="h-7 w-7 rounded-full object-cover border border-slate-700"
                                />
                              ) : (
                                <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-white border border-slate-700 text-xs">
                                  <UserIcon size={12} />
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex flex-col max-w-[70%]">
                            <div
                              className="rounded-2xl px-4 py-2.5 text-sm shadow-sm wrap-break-word"
                              style={{
                                backgroundColor: isMe
                                  ? '#00F0FF'
                                  : 'rgba(255, 255, 255, 0.08)',
                                color: isMe ? '#0A192F' : '#f8fafc',
                                borderRadius: isMe
                                  ? '20px 20px 4px 20px'
                                  : '20px 20px 20px 4px',
                              }}
                            >
                              {msg.body}
                            </div>
                            <span
                              className={`text-[9px] text-slate-400 mt-1 ${
                                isMe ? 'text-right' : 'text-left'
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t flex items-center gap-2 bg-[#112240]"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={t(
                      'chat.inputPlaceholder',
                      'Nhập nội dung tin nhắn...',
                    )}
                    className="flex-1 bg-[#0a192f] text-white text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00F0FF] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="p-2.5 rounded-xl bg-[#00F0FF] text-[#0A192F] hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                <MessageSquare className="h-16 w-16 text-slate-700 mb-2" />
                <h3 className="text-lg font-bold text-slate-300">
                  {t(
                    'chat.noConversationSelected',
                    'Không có cuộc trò chuyện nào được chọn',
                  )}
                </h3>
                <p className="text-sm mt-1 text-slate-500">
                  {t(
                    'chat.noConversationSelectedDesc',
                    'Chọn một cuộc trò chuyện từ cột bên trái để bắt đầu nhắn tin.',
                  )}
                </p>
              </div>
            )}
          </div>

          {/* 3. Right Pane - Context Booking Sidebar (Premium) */}
          {activeConversation && activeConversation.bookingId && (
            <div
              className="hidden lg:flex w-64 border-l flex-col p-4 space-y-4 overflow-y-auto"
              style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
            >
              <h3
                className="text-sm font-bold text-white uppercase tracking-wider border-b pb-2 mb-2"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
              >
                {t('chat.bookingInfo', 'Thông tin Booking')}
              </h3>

              <div className="space-y-3 text-xs">
                {activeConversation.tourName && (
                  <div>
                    <span className="text-slate-400 block mb-1">
                      {t('chat.tourService', 'Tour dịch vụ')}
                    </span>
                    <div className="font-semibold text-slate-200 bg-[#1d2d50] p-2 rounded-lg border border-slate-800">
                      {activeConversation.tourName}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#182746] p-2.5 rounded-xl border border-slate-800/40">
                    <span className="text-slate-400 block text-[10px] uppercase">
                      {t('chat.bookingCodeLabel', 'Mã đơn')}
                    </span>
                    <span className="font-bold text-[#00F0FF]">
                      #{activeConversation.bookingCode}
                    </span>
                  </div>
                  <div className="bg-[#182746] p-2.5 rounded-xl border border-slate-800/40">
                    <span className="text-slate-400 block text-[10px] uppercase">
                      {t('chat.statusLabel', 'Trạng thái')}
                    </span>
                    <span className="font-bold text-emerald-400">
                      {t('chat.statusBooked', 'Đã đặt')}
                    </span>
                  </div>
                </div>

                <div className="bg-[#182746] p-3 rounded-xl border border-slate-800/40 space-y-2">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />{' '}
                      {t('chat.standardLabel', 'Tiêu chuẩn')}
                    </span>
                    <span className="font-semibold">
                      {t('chat.activeState', 'Hoạt động')}
                    </span>
                  </div>
                  <div
                    className="flex justify-between items-center text-slate-300 border-t pt-2"
                    style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                  >
                    <span className="flex items-center gap-1">
                      <DollarSign size={12} />{' '}
                      {t('chat.paymentLabel', 'Thanh toán')}
                    </span>
                    <span className="font-bold text-slate-100">
                      {t('chat.realtimeState', 'Thời gian thực')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-auto bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-400 text-[11px] flex gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  {t(
                    'chat.rulesNotice',
                    'Mọi thỏa thuận qua chat cần tuân thủ Điều khoản & Quy định của DDMS.',
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
