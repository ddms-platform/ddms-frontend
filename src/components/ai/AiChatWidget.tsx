import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Maximize2,
  Minimize2,
  Trash2,
  Anchor,
  Compass,
  Clock,
  Star,
  Calendar,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  CalendarDays,
} from 'lucide-react';
import { toast } from 'sonner';
import { streamAiChat } from '@/services/aiService';
import type { ChatMessage } from '@/interfaces/ai-chat';
import { formatPrice, formatMessageText } from '@/utils/ai-format';
import { useTripCart } from '@/contexts/TripCartContext';

export const AiChatWidget: React.FC = () => {
  const navigate = useNavigate();
  const { setCart } = useTripCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Xin chào! Mình là **DDMS Trip Concierge** ✨\n\nMình sẽ giúp bạn lên kế hoạch chuyến đi hoàn hảo ở Đà Nẵng — từ 1 tour lẻ đến combo nhiều ngày.\n\nBạn muốn đi với ai, ngày nào, budget bao nhiêu? Cứ nói tự nhiên nhé!',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const launcherRef = useRef<HTMLDivElement>(null);
  const [launcherPos, setLauncherPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    moved: false,
  });
  const DRAG_THRESHOLD = 8;

  const clampLauncherPos = (x: number, y: number, el: HTMLElement) => {
    const maxX = window.innerWidth - el.offsetWidth;
    const maxY = window.innerHeight - el.offsetHeight;
    return {
      x: Math.min(Math.max(0, x), Math.max(0, maxX)),
      y: Math.min(Math.max(0, y), Math.max(0, maxY)),
    };
  };

  useEffect(() => {
    const onResize = () => {
      const el = launcherRef.current;
      if (!el || !launcherPos) return;
      setLauncherPos((prev) =>
        prev ? clampLauncherPos(prev.x, prev.y, el) : prev,
      );
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [launcherPos]);

  const speechSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = () => {
    if (!speechSupported) {
      toast.error('Trình duyệt không hỗ trợ nhận diện giọng nói.');
      return;
    }

    const SR: any =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'vi-VN';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e: { error: string }) => {
      setIsListening(false);
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        toast.error(
          e.error === 'not-allowed'
            ? 'Vui lòng cấp quyền micro cho trình duyệt.'
            : 'Không nhận được giọng nói. Thử lại.',
        );
      }
    };
    recognition.onresult = (event: {
      results: ArrayLike<ArrayLike<{ transcript: string }>> & {
        [i: number]: ArrayLike<{ transcript: string }> & { isFinal?: boolean };
      };
    }) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += (
          event.results[i] as unknown as { [k: number]: { transcript: string } }
        )[0].transcript;
      }
      setInputMessage(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // Text-to-Speech
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const ttsSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speakMessage = (msgId: string, text: string) => {
    if (!ttsSupported) {
      toast.error('Trình duyệt không hỗ trợ đọc văn bản.');
      return;
    }
    window.speechSynthesis.cancel();
    // Strip markdown, IDs, emoji-heavy chars
    const clean = text
      .replace(/\[ID:\s*[0-9a-f-]+\]/gi, '')
      .replace(/\*\*/g, '')
      .replace(/[#*_`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!clean) return;
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = 'vi-VN';
    utter.rate = 1.05;
    utter.pitch = 1;
    // Prefer Vietnamese voice if available
    const voices = window.speechSynthesis.getVoices();
    const vnVoice = voices.find((v) => v.lang.startsWith('vi'));
    if (vnVoice) utter.voice = vnVoice;
    utter.onend = () => setSpeakingMsgId(null);
    utter.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utter);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeakingMsgId(null);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Date range picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const dateLabel = () => {
    if (!dateFrom && !dateTo) return '';
    if (dateFrom && !dateTo) return dateFrom;
    if (dateFrom === dateTo) return dateFrom;
    return `${dateFrom} → ${dateTo}`;
  };
  const clearDates = () => {
    setDateFrom('');
    setDateTo('');
  };

  const quickPrompts = [
    '👨‍👩‍👧 Gia đình 4 người, 2 ngày cuối tuần, budget 3 triệu',
    '💑 Tour lãng mạn cho 2 người, ngắm hoàng hôn',
    '💸 Tour dưới 300k, thời lượng ngắn',
    '🌅 Lịch tour tối nay còn chỗ không?',
    '🐟 Tôi thích câu cá và ăn hải sản tươi',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    let query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    // Prefix date context if user picked dates
    const label = dateLabel();
    if (label && !textToSend) {
      query = `[Ngày dự kiến: ${label}] ${query}`;
    }

    const userMsgId = Date.now().toString();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    const aiMsgId = (Date.now() + 1).toString();
    // Placeholder AI message that will be filled incrementally
    setMessages((prev) => [
      ...prev,
      {
        id: aiMsgId,
        sender: 'ai',
        text: '',
        timestamp: new Date(),
      },
    ]);

    try {
      let accumulated = '';
      await streamAiChat(query, conversationId || undefined, (chunk) => {
        if (chunk.type === 'chunk' && chunk.delta) {
          accumulated += chunk.delta;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId ? { ...m, text: accumulated } : m,
            ),
          );
        } else if (chunk.type === 'done') {
          if (chunk.conversationId) setConversationId(chunk.conversationId);
          if (chunk.recommendedTours) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId
                  ? { ...m, recommendedTours: chunk.recommendedTours }
                  : m,
              ),
            );
          }
        } else if (chunk.type === 'error') {
          throw new Error(chunk.error ?? 'AI error');
        }
      });
    } catch (err) {
      console.error('AI Chat Error:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                text: 'Xin lỗi, kết nối tới Trợ lý AI đang gián đoạn. Bạn vui lòng thử lại sau giây lát!',
              }
            : m,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setConversationId(null);
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: 'Xin chào! Mình là **DDMS Trip Concierge** ✨\n\nMình sẽ giúp bạn lên kế hoạch chuyến đi hoàn hảo ở Đà Nẵng — từ 1 tour lẻ đến combo nhiều ngày.\n\nBạn muốn đi với ai, ngày nào, budget bao nhiêu? Cứ nói tự nhiên nhé!',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      {!isOpen && (
        <div
          ref={launcherRef}
          className="fixed z-9999 cursor-grab touch-none active:cursor-grabbing"
          style={
            launcherPos
              ? { left: launcherPos.x, top: launcherPos.y }
              : { right: 24, bottom: 24 }
          }
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            const el = e.currentTarget;
            const rect = el.getBoundingClientRect();
            dragRef.current = {
              pointerId: e.pointerId,
              startX: e.clientX,
              startY: e.clientY,
              origX: rect.left,
              origY: rect.top,
              moved: false,
            };
            el.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            const d = dragRef.current;
            if (d.pointerId !== e.pointerId) return;
            const dx = e.clientX - d.startX;
            const dy = e.clientY - d.startY;
            if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
            d.moved = true;
            setLauncherPos(
              clampLauncherPos(d.origX + dx, d.origY + dy, e.currentTarget),
            );
          }}
          onPointerUp={(e) => {
            const d = dragRef.current;
            if (d.pointerId !== e.pointerId) return;
            d.pointerId = -1;
            if (!d.moved) setIsOpen(true);
          }}
          onPointerCancel={(e) => {
            const d = dragRef.current;
            if (d.pointerId !== e.pointerId) return;
            d.pointerId = -1;
          }}
        >
          <div className="absolute -inset-1 rounded-full bg-linear-to-r from-cyan-500 to-blue-600 blur-md opacity-75 animate-pulse pointer-events-none" />

          <button
            type="button"
            className="relative flex items-center gap-2.5 bg-linear-to-r from-[#001c38] to-[#003865] hover:from-[#002850] hover:to-[#004b85] text-white px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-cyan-400/30 pointer-events-none"
            aria-label="Open AI Assistant"
          >
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-cyan-400/20 text-cyan-300">
              <Sparkles size={18} className="animate-spin-slow" />
            </div>
            <span className="font-semibold text-sm tracking-wide hidden sm:inline">
              Trip Concierge ✨
            </span>
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping absolute top-1.5 right-1.5" />
          </button>
        </div>
      )}

      {/* ── Chatbot Window Popup ── */}
      {isOpen && (
        <div
          className={`fixed z-[9999] transition-all duration-300 flex flex-col shadow-2xl rounded-2xl border border-border bg-background/95 dark:bg-[#061527]/95 backdrop-blur-2xl overflow-hidden ${
            isExpanded
              ? 'inset-4 md:inset-10 max-w-5xl mx-auto my-auto h-[90vh]'
              : 'bottom-4 right-4 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-linear-to-r from-[#001c38] via-[#002d56] to-[#001c38] text-white border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-linear-to-tr from-cyan-400 to-blue-500 text-slate-900 shadow-md font-bold">
                <Bot size={20} />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  DDMS Trip Concierge
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-medium">
                    AI
                  </span>
                </h3>
                <p className="text-[11px] text-cyan-200/80">
                  Chuyên viên tư vấn hành trình 24/7
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Xóa lịch sử trò chuyện"
              >
                <Trash2 size={16} />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer hidden sm:block"
                title={isExpanded ? 'Thu nhỏ' : 'Phóng to'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                aria-label="Close AI Chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
                    <Bot size={16} />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2`}>
                  <div
                    className={`px-4 py-3 rounded-2xl relative group/bubble ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md'
                        : 'bg-muted/80 dark:bg-slate-800/80 text-foreground border border-border/50 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {formatMessageText(msg.text)}
                    </p>
                    {msg.sender === 'ai' &&
                      ttsSupported &&
                      msg.id !== 'welcome' && (
                        <button
                          type="button"
                          onClick={() =>
                            speakingMsgId === msg.id
                              ? stopSpeaking()
                              : speakMessage(msg.id, msg.text)
                          }
                          className={`absolute -bottom-1 -right-1 p-1.5 rounded-full border border-border shadow-sm transition-all ${
                            speakingMsgId === msg.id
                              ? 'bg-cyan-500 text-white'
                              : 'bg-background text-muted-foreground opacity-0 group-hover/bubble:opacity-100 hover:text-cyan-600'
                          }`}
                          title={
                            speakingMsgId === msg.id
                              ? 'Dừng đọc'
                              : 'AI đọc tin nhắn'
                          }
                        >
                          {speakingMsgId === msg.id ? (
                            <VolumeX size={12} />
                          ) : (
                            <Volume2 size={12} />
                          )}
                        </button>
                      )}
                  </div>

                  {/* Recommended Tour Cards */}
                  {msg.recommendedTours && msg.recommendedTours.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          <Compass size={12} className="text-cyan-500" />
                          {msg.recommendedTours.length > 1
                            ? `Combo ${msg.recommendedTours.length} tour đề xuất:`
                            : 'Tour phù hợp nhất dành cho bạn:'}
                        </p>
                        {msg.recommendedTours.length >= 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const items = msg.recommendedTours!.map((t) => ({
                                tourId: t.id,
                                tourName: t.title,
                                price: t.price,
                                imageUrl: t.imageUrl,
                              }));
                              setCart(items);
                              toast.success(
                                `Đã thêm combo ${items.length} tour vào giỏ`,
                              );
                              navigate(`/tours/${items[0].tourId}/booking`);
                              setIsOpen(false);
                            }}
                            className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-sm hover:opacity-90"
                          >
                            🛒 Đặt cả combo
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {msg.recommendedTours.map((tour) => (
                          <div
                            key={tour.id}
                            className="rounded-xl border border-border/80 bg-card hover:bg-accent/40 transition-all duration-200 shadow-sm group overflow-hidden"
                          >
                            <div
                              className="flex items-center gap-3 p-2.5 cursor-pointer"
                              onClick={() => navigate(`/tours/${tour.id}`)}
                            >
                              {tour.imageUrl ? (
                                <img
                                  src={tour.imageUrl}
                                  alt={tour.title}
                                  className="w-16 h-16 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-cyan-500/10 text-cyan-600 flex items-center justify-center shrink-0">
                                  <Anchor size={24} />
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-xs text-foreground truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                  {tour.title}
                                </h4>

                                <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground mt-1">
                                  <span className="font-bold text-ddms-secondary flex items-center gap-0.5">
                                    {formatPrice(tour.price)}
                                  </span>
                                  {tour.duration && (
                                    <span className="flex items-center gap-0.5">
                                      <Clock size={10} />
                                      {tour.duration}
                                    </span>
                                  )}
                                  {typeof tour.avgRating === 'number' &&
                                    tour.avgRating > 0 && (
                                      <span className="flex items-center gap-0.5 text-amber-500">
                                        <Star
                                          size={10}
                                          fill="currentColor"
                                          strokeWidth={0}
                                        />
                                        {tour.avgRating.toFixed(1)}
                                        {tour.totalReviews
                                          ? ` (${tour.totalReviews})`
                                          : ''}
                                      </span>
                                    )}
                                </div>
                                {tour.nextDeparture && (
                                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5">
                                    <Calendar size={10} />
                                    Lịch gần nhất:{' '}
                                    {new Date(
                                      tour.nextDeparture,
                                    ).toLocaleString('vi-VN', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex border-t border-border/50">
                              <button
                                type="button"
                                onClick={() => navigate(`/tours/${tour.id}`)}
                                className="flex-1 text-[11px] py-1.5 text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors"
                              >
                                Xem chi tiết
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/tours/${tour.id}/booking`)
                                }
                                className="flex-1 text-[11px] py-1.5 font-semibold text-white bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-colors"
                              >
                                Đặt ngay →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-600/20">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-600 flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-muted/80 text-foreground border border-border/50 rounded-bl-none flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Pills */}
          {messages.length < 5 && (
            <div className="px-4 py-2 border-t border-border/40 bg-muted/20 overflow-x-auto flex gap-1.5 scrollbar-none shrink-0">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-card hover:bg-accent border border-border/60 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 border-t border-border bg-background shrink-0 relative">
            {showDatePicker && (
              <div className="absolute bottom-full left-3 mb-2 z-50 bg-card border border-border rounded-xl p-3 shadow-lg w-64">
                <p className="text-xs font-semibold text-foreground mb-2">
                  Chọn ngày dự kiến
                </p>
                <label className="block text-[10px] text-muted-foreground">
                  Từ
                </label>
                <input
                  type="date"
                  min={today}
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full h-8 px-2 mb-2 bg-muted border border-border rounded text-xs"
                />
                <label className="block text-[10px] text-muted-foreground">
                  Đến (tuỳ chọn)
                </label>
                <input
                  type="date"
                  min={dateFrom || today}
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full h-8 px-2 mb-2 bg-muted border border-border rounded text-xs"
                />
                <div className="flex justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      clearDates();
                      setShowDatePicker(false);
                    }}
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Xoá
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(false)}
                    className="text-[10px] font-semibold text-cyan-600 hover:text-cyan-500"
                  >
                    Xong
                  </button>
                </div>
              </div>
            )}

            {dateLabel() && (
              <div className="mb-2 inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                <CalendarDays size={11} />
                {dateLabel()}
                <button
                  type="button"
                  onClick={clearDates}
                  className="ml-1 hover:text-foreground"
                >
                  <X size={10} />
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => setShowDatePicker((v) => !v)}
                className={`p-2.5 rounded-xl transition-all shrink-0 ${
                  dateLabel() || showDatePicker
                    ? 'bg-cyan-500/10 text-cyan-600'
                    : 'bg-muted/60 text-muted-foreground hover:bg-cyan-500/10 hover:text-cyan-600'
                }`}
                title="Chọn ngày dự kiến"
              >
                <CalendarDays size={16} />
              </button>
              <input
                type="text"
                placeholder={
                  isListening
                    ? '🎙️ Đang nghe... hãy nói'
                    : 'Cho mình biết bạn muốn trải nghiệm gì...'
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-muted/50 focus:bg-background border border-border focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all"
              />

              {speechSupported && (
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading}
                  className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer shrink-0 ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-muted/60 text-muted-foreground hover:bg-cyan-500/10 hover:text-cyan-600'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                  title={isListening ? 'Dừng nghe' : 'Nói với AI (tiếng Việt)'}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              )}

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AiChatWidget;
