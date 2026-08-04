import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ChevronRight,
  Maximize2,
  Minimize2,
  Trash2,
  Anchor,
  Compass,
  Clock,
} from 'lucide-react';
import { aiService } from '@/services/aiService';
import type { AiChatResponse } from '@/services/aiService';
import type { ChatMessage } from '@/interfaces/ai-chat';
import { formatPrice, formatMessageText } from '@/utils/ai-format';

export const AiChatWidget: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ lý AI du thuyền DDMS 🚢. Tôi có thể giúp bạn tìm kiếm tour ngắm Cầu Rồng, tư vấn giá vé, chọn du thuyền hoặc kiểm tra lịch trình. Bạn muốn trải nghiệm tour nào hôm nay?',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    '🔥 Tour ngắm Cầu Rồng phun lửa',
    '💸 Du thuyền Sông Hàn có ăn tối giá bao nhiêu?',
    '🚢 Tư vấn tour du thuyền cho gia đình 4 người',
    '🌊 Lịch khởi hành du thuyền tối nay',
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
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

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

    try {
      const res: AiChatResponse = await aiService.sendMessage(
        query,
        conversationId || undefined,
      );

      if (res.conversationId) {
        setConversationId(res.conversationId);
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.reply,
        recommendedTours: res.recommendedTours,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI Chat Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Xin lỗi, kết nối tới Trợ lý AI đang gián đoạn. Bạn vui lòng thử lại sau giây lát!',
          timestamp: new Date(),
        },
      ]);
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
        text: 'Xin chào! Tôi là Trợ lý AI du thuyền DDMS 🚢. Tôi có thể giúp bạn tìm kiếm tour ngắm Cầu Rồng, tư vấn giá vé, chọn du thuyền hoặc kiểm tra lịch trình. Bạn muốn trải nghiệm tour nào hôm nay?',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-9999">
          {/* Glowing Aura Ring */}
          <div className="absolute -inset-1 rounded-full bg-linear-to-r from-cyan-500 to-blue-600 blur-md opacity-75 animate-pulse" />

          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-2.5 bg-linear-to-r from-[#001c38] to-[#003865] hover:from-[#002850] hover:to-[#004b85] text-white px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-cyan-400/30 cursor-pointer"
            aria-label="Open AI Assistant"
          >
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-cyan-400/20 text-cyan-300">
              <Sparkles size={18} className="animate-spin-slow" />
            </div>
            <span className="font-semibold text-sm tracking-wide hidden sm:inline">
              Trợ lý AI DDMS
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
                  Trợ lý AI DDMS
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-medium">
                    Gemini 1.5
                  </span>
                </h3>
                <p className="text-[11px] text-cyan-200/80">
                  Tư vấn tour du thuyền 24/7
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
                    className={`px-4 py-3 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md'
                        : 'bg-muted/80 dark:bg-slate-800/80 text-foreground border border-border/50 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {formatMessageText(msg.text)}
                    </p>
                  </div>

                  {/* Recommended Tour Cards */}
                  {msg.recommendedTours && msg.recommendedTours.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Compass size={12} className="text-cyan-500" />
                        Gợi ý tour phù hợp nhất dành cho bạn:
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {msg.recommendedTours.map((tour) => (
                          <div
                            key={tour.id}
                            className="flex items-center gap-3 p-2.5 rounded-xl border border-border/80 bg-card hover:bg-accent/40 transition-all duration-200 shadow-sm group cursor-pointer"
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

                              <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                                <span className="font-bold text-ddms-secondary flex items-center gap-0.5">
                                  {formatPrice(tour.price)}
                                </span>
                                {tour.duration && (
                                  <span className="flex items-center gap-0.5">
                                    <Clock size={10} />
                                    {tour.duration}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="p-1 text-muted-foreground group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all">
                              <ChevronRight size={16} />
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
          <div className="p-3 border-t border-border bg-background shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Hỏi AI về tour du thuyền, giá vé..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-muted/50 focus:bg-background border border-border focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all"
              />

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
