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
  Smile,
  Paperclip,
  X,
  Mic,
  Square,
} from 'lucide-react';
import EmojiPicker, {
  EmojiStyle,
  Theme as EmojiTheme,
} from 'emoji-picker-react';
import { useAuth } from '@/hooks/use-auth';
import { chatService } from '@/services/chatService';
import { chatSignalRService } from '@/services/chatSignalRService';
import type { ConversationResponse, MessageResponse } from '@/interfaces/chat';
import { toast } from 'sonner';
import Breadcrumb, {
  type BreadcrumbItem,
} from '@/components/shared/breadcrumb';

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingFilePreview, setPendingFilePreview] = useState<string | null>(
    null,
  );
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    if (!showEmojiPicker) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        emojiPickerRef.current?.contains(target) ||
        emojiButtonRef.current?.contains(target)
      ) {
        return;
      }
      setShowEmojiPicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmojiPicker]);

  // Cleanup blob preview when file changes
  useEffect(() => {
    return () => {
      if (pendingFilePreview) URL.revokeObjectURL(pendingFilePreview);
    };
  }, [pendingFilePreview]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.id]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || sending) return;
    const body = inputText.trim();
    if (!body && !pendingFile) return;

    setSending(true);
    const savedFile = pendingFile;
    const savedPreview = pendingFilePreview;
    setInputText('');
    setPendingFile(null);
    setPendingFilePreview(null);
    setShowEmojiPicker(false);

    try {
      let attachment: {
        attachmentUrl: string;
        attachmentType: string;
        attachmentName: string;
      } | null = null;

      if (savedFile) {
        setUploadingAttachment(true);
        try {
          const uploaded = await chatService.uploadAttachment(
            activeConversation.id,
            savedFile,
          );
          attachment = {
            attachmentUrl: uploaded.url,
            attachmentType: uploaded.type,
            attachmentName: uploaded.name,
          };
        } finally {
          setUploadingAttachment(false);
        }
      }

      const newMsg = await chatService.sendMessage(activeConversation.id, {
        body: body || undefined,
        ...(attachment ?? {}),
      });
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      const preview =
        body ||
        (attachment?.attachmentType === 'video'
          ? '[Video]'
          : attachment?.attachmentType === 'audio'
            ? '[Tin nhắn thoại]'
            : attachment?.attachmentType === 'image'
              ? '[Hình ảnh]'
              : '');
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? {
                ...c,
                lastMessage: preview,
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
      // Restore on failure
      setInputText(body);
      if (savedFile) {
        setPendingFile(savedFile);
        setPendingFilePreview(savedPreview);
      }
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error(
        t('chat.errors.invalidFileType', 'Chỉ hỗ trợ ảnh hoặc video.'),
      );
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error(t('chat.errors.fileTooLarge', 'Tệp vượt quá 50 MB.'));
      return;
    }
    setPendingFile(file);
    setPendingFilePreview(URL.createObjectURL(file));
  };

  const clearPendingFile = () => {
    if (pendingFilePreview) URL.revokeObjectURL(pendingFilePreview);
    setPendingFile(null);
    setPendingFilePreview(null);
  };

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    setInputText((prev) => prev + emojiData.emoji);
  };

  const stopRecordingTimer = () => {
    if (recordTimerRef.current !== null) {
      window.clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  };

  const startRecording = async () => {
    if (isRecording || pendingFile) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error(
        t('chat.errors.micUnavailable', 'Trình duyệt không hỗ trợ ghi âm.'),
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      recordChunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) recordChunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        stopRecordingTimer();
        setIsRecording(false);
        if (recordChunksRef.current.length === 0) return;
        const blob = new Blob(recordChunksRef.current, {
          type: mime.split(';')[0],
        });
        const ext = mime.includes('webm') ? 'webm' : 'm4a';
        const file = new File([blob], `voice-${Date.now()}.${ext}`, {
          type: blob.type,
        });
        setPendingFile(file);
        setPendingFilePreview(URL.createObjectURL(file));
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => {
          if (s >= 60) {
            recorder.stop();
            return s;
          }
          return s + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Mic permission denied:', err);
      toast.error(
        t(
          'chat.errors.micDenied',
          'Không thể truy cập microphone. Kiểm tra quyền trình duyệt.',
        ),
      );
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      recordChunksRef.current = [];
      mediaRecorderRef.current.stop();
    }
  };

  useEffect(() => {
    return () => {
      stopRecordingTimer();
      if (mediaRecorderRef.current?.state === 'recording') {
        recordChunksRef.current = [];
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const isOwner = user?.roles.includes('owner') ?? false;

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: t('nav.home', 'Trang chủ'), to: '/' },
  ];

  if (isOwner) {
    breadcrumbItems.push({
      label: t('header.user.ownerDashboard', 'Dashboard chủ thuyền'),
      to: '/owner',
    });
  }

  breadcrumbItems.push({
    label: t('chat.inboxTitle', 'Hộp thư tin nhắn'),
  });

  return (
    <div
      className="flex flex-1 overflow-hidden"
      style={{
        height: 'calc(100vh - 80px)', // Adjust based on header height
        backgroundColor: 'var(--ddms-bg-main)',
      }}
    >
      <div className="container mx-auto px-4 py-4 flex flex-col flex-1 overflow-hidden">
        {/* Breadcrumb */}
        <div className="shrink-0 mb-3">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className="flex flex-1 rounded-2xl border overflow-hidden border-border bg-ddms-bg-card shadow-sm">
          {/* 1. Sidebar - Conversations List */}
          <div
            className={`w-full md:w-80 flex flex-col border-r border-border overflow-hidden transition-all ${
              activeConversation ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-ddms-secondary" />
                {t('chat.inboxTitle', 'Hộp thư tin nhắn')}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loadingConvs ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <Loader2 className="h-6 w-6 text-ddms-secondary animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    {t('chat.loadingConvs', 'Đang tải cuộc hội thoại...')}
                  </span>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <Inbox className="h-12 w-12 text-muted-foreground/60 mb-2" />
                  <p className="text-sm font-semibold text-foreground">
                    {t('chat.noConversations', 'Không có cuộc trò chuyện nào')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
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
                      className="w-full text-left p-3 rounded-xl flex items-center gap-3 hover:bg-foreground/5 transition-colors relative"
                      style={{
                        backgroundColor: isSelected
                          ? 'var(--border)'
                          : 'transparent',
                      }}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {c.partnerAvatar ? (
                          <img
                            src={c.partnerAvatar}
                            alt={c.partnerName}
                            className="h-10 w-10 rounded-full object-cover border border-border"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-foreground border border-border">
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
                          <span className="text-sm font-bold text-foreground truncate">
                            {c.partnerName}
                          </span>
                          {c.lastMessageAt && (
                            <span className="text-[10px] text-muted-foreground">
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
                          className={`text-xs truncate mt-0.5 ${c.unreadCount > 0 ? 'text-foreground font-bold' : 'text-muted-foreground'}`}
                        >
                          {c.lastMessage ||
                            t('chat.noMessagesYet', 'Chưa có tin nhắn')}
                        </p>
                        {c.tourName && (
                          <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-muted text-ddms-secondary truncate max-w-full">
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
            className={`flex-1 flex flex-col overflow-hidden bg-ddms-bg-card ${
              !activeConversation ? 'hidden md:flex' : 'flex'
            }`}
          >
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center gap-3 bg-muted">
                  <button
                    onClick={() => setActiveConversation(null)}
                    className="md:hidden p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-foreground/5"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  {activeConversation.partnerAvatar ? (
                    <img
                      src={activeConversation.partnerAvatar}
                      alt={activeConversation.partnerName}
                      className="h-9 w-9 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-foreground border border-border">
                      <UserIcon size={16} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground truncate">
                      {activeConversation.partnerName}
                    </h3>
                    <p className="text-[11px] text-ddms-secondary truncate">
                      {activeConversation.bookingCode
                        ? `${t('chat.bookingPrefix', 'Đơn đặt:')} #${activeConversation.bookingCode}`
                        : t('chat.chatDefaultTitle', 'Trò chuyện')}
                    </p>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-ddms-bg-main">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 text-ddms-secondary animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
                      <MessageSquare className="h-10 w-10 text-muted-foreground/50 mb-2" />
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
                                  className="h-7 w-7 rounded-full object-cover border border-border"
                                />
                              ) : (
                                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-foreground border border-border text-xs">
                                  <UserIcon size={12} />
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex flex-col max-w-[70%] gap-1">
                            {msg.attachmentUrl && (
                              <div
                                className="overflow-hidden rounded-2xl border border-border"
                                style={{
                                  borderRadius: isMe
                                    ? '20px 20px 4px 20px'
                                    : '20px 20px 20px 4px',
                                }}
                              >
                                {msg.attachmentType === 'video' ? (
                                  <video
                                    src={msg.attachmentUrl}
                                    controls
                                    className="max-h-72 w-full bg-black"
                                  />
                                ) : msg.attachmentType === 'audio' ? (
                                  <audio
                                    src={msg.attachmentUrl}
                                    controls
                                    className="h-10 w-64 max-w-full"
                                  />
                                ) : (
                                  <a
                                    href={msg.attachmentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <img
                                      src={msg.attachmentUrl}
                                      alt={msg.attachmentName || 'attachment'}
                                      className="max-h-72 w-full object-cover"
                                    />
                                  </a>
                                )}
                              </div>
                            )}
                            {msg.body && (
                              <div
                                className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm wrap-break-word ${isMe ? 'bg-ddms-secondary text-primary-foreground' : 'bg-ddms-bg-card text-foreground border border-border'}`}
                                style={{
                                  borderRadius: isMe
                                    ? '20px 20px 4px 20px'
                                    : '20px 20px 20px 4px',
                                }}
                              >
                                {msg.body}
                              </div>
                            )}
                            <span
                              className={`text-[9px] text-muted-foreground mt-1 ${
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
                  className="relative p-3 border-t border-border bg-muted"
                >
                  {pendingFile && (
                    <div className="mb-2 flex items-center gap-3 rounded-lg border border-border bg-ddms-bg-main p-2">
                      {pendingFile.type.startsWith('image/') ? (
                        <img
                          src={pendingFilePreview ?? undefined}
                          alt="preview"
                          className="h-14 w-14 rounded object-cover"
                        />
                      ) : pendingFile.type.startsWith('audio/') ? (
                        <audio
                          src={pendingFilePreview ?? undefined}
                          controls
                          className="h-10 flex-1 max-w-xs"
                        />
                      ) : (
                        <video
                          src={pendingFilePreview ?? undefined}
                          className="h-14 w-14 rounded object-cover bg-black"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {pendingFile.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {(pendingFile.size / 1024 / 1024).toFixed(2)} MB
                          {uploadingAttachment && ' · đang tải lên...'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={clearPendingFile}
                        disabled={uploadingAttachment}
                        className="p-1 rounded hover:bg-muted disabled:opacity-50"
                      >
                        <X size={14} className="text-muted-foreground" />
                      </button>
                    </div>
                  )}

                  {showEmojiPicker && (
                    <div
                      ref={emojiPickerRef}
                      className="absolute bottom-full left-3 mb-2 z-50"
                    >
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        emojiStyle={EmojiStyle.NATIVE}
                        theme={EmojiTheme.AUTO}
                        width={320}
                        height={380}
                        lazyLoadEmojis
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      ref={emojiButtonRef}
                      type="button"
                      onClick={() => setShowEmojiPicker((v) => !v)}
                      disabled={isRecording}
                      className="p-2 rounded-xl text-muted-foreground hover:bg-ddms-bg-main hover:text-foreground transition-colors disabled:opacity-40"
                      title={t('chat.emojiPicker', 'Chọn biểu tượng cảm xúc')}
                    >
                      <Smile size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!!pendingFile || isRecording}
                      className="p-2 rounded-xl text-muted-foreground hover:bg-ddms-bg-main hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title={t('chat.attachFile', 'Gửi ảnh/video')}
                    >
                      <Paperclip size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={!!pendingFile && !isRecording}
                      className={`p-2 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        isRecording
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'text-muted-foreground hover:bg-ddms-bg-main hover:text-foreground'
                      }`}
                      title={
                        isRecording
                          ? t('chat.stopRecording', 'Dừng ghi âm')
                          : t('chat.recordVoice', 'Ghi âm giọng nói')
                      }
                    >
                      {isRecording ? <Square size={18} /> : <Mic size={18} />}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {isRecording ? (
                      <div className="flex-1 flex items-center gap-3 bg-ddms-bg-main text-foreground text-sm px-4 py-2.5 rounded-xl border border-red-500/40">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-medium">
                          {t('chat.recording', 'Đang ghi âm')}{' '}
                          {Math.floor(recordingSeconds / 60)
                            .toString()
                            .padStart(2, '0')}
                          :{(recordingSeconds % 60).toString().padStart(2, '0')}
                        </span>
                        <button
                          type="button"
                          onClick={cancelRecording}
                          className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                        >
                          {t('chat.cancel', 'Hủy')}
                        </button>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={t(
                          'chat.inputPlaceholder',
                          'Nhập nội dung tin nhắn...',
                        )}
                        className="flex-1 bg-ddms-bg-main text-foreground text-sm px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-ddms-secondary transition-all"
                      />
                    )}
                    <button
                      type="submit"
                      disabled={
                        (!inputText.trim() && !pendingFile) ||
                        sending ||
                        isRecording
                      }
                      className="p-2.5 rounded-xl bg-ddms-secondary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                <MessageSquare className="h-16 w-16 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-bold text-foreground">
                  {t(
                    'chat.noConversationSelected',
                    'Không có cuộc trò chuyện nào được chọn',
                  )}
                </h3>
                <p className="text-sm mt-1 text-muted-foreground/80">
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
            <div className="hidden lg:flex w-64 border-l border-border flex-col p-4 space-y-4 overflow-y-auto">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-2 mb-2">
                {t('chat.bookingInfo', 'Thông tin Booking')}
              </h3>

              <div className="space-y-3 text-xs">
                {activeConversation.tourName && (
                  <div>
                    <span className="text-muted-foreground block mb-1">
                      {t('chat.tourService', 'Tour dịch vụ')}
                    </span>
                    <div className="font-semibold text-foreground bg-muted p-2 rounded-lg border border-border">
                      {activeConversation.tourName}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted p-2.5 rounded-xl border border-border">
                    <span className="text-muted-foreground block text-[10px] uppercase">
                      {t('chat.bookingCodeLabel', 'Mã đơn')}
                    </span>
                    <span className="font-bold text-ddms-secondary">
                      #{activeConversation.bookingCode}
                    </span>
                  </div>
                  <div className="bg-muted p-2.5 rounded-xl border border-border">
                    <span className="text-muted-foreground block text-[10px] uppercase">
                      {t('chat.statusLabel', 'Trạng thái')}
                    </span>
                    <span className="font-bold text-emerald-500">
                      {t('chat.statusBooked', 'Đã đặt')}
                    </span>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-xl border border-border space-y-2">
                  <div className="flex justify-between items-center text-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />{' '}
                      {t('chat.standardLabel', 'Tiêu chuẩn')}
                    </span>
                    <span className="font-semibold">
                      {t('chat.activeState', 'Hoạt động')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-foreground border-t border-border pt-2">
                    <span className="flex items-center gap-1">
                      <DollarSign size={12} />{' '}
                      {t('chat.paymentLabel', 'Thanh toán')}
                    </span>
                    <span className="font-bold text-foreground">
                      {t('chat.realtimeState', 'Thời gian thực')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-auto bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-500 text-[11px] flex gap-2">
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
