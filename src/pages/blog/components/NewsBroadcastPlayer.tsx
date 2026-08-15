import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import type { VideoScene } from '@/services/blogService';
import NewsAnchor from './NewsAnchor';
import { useVietnameseVoice } from './useVietnameseVoice';

interface NewsBroadcastPlayerProps {
  scenes: VideoScene[];
  fallbackImage?: string | null;
  title: string;
  sourceName?: string | null;
}

/**
 * Bản tin dựng ngay trên trình duyệt: người dẫn mấp máy môi, màn hình sau lưng
 * đổi ảnh theo cảnh, thanh chữ chạy dưới cùng, giọng đọc tiếng Việt bằng
 * Web Speech API.
 *
 * Không render MP4 trên server — như vậy phải cài ffmpeg và một dịch vụ TTS lên
 * EC2. Đổi lại, cách này không xuất được file để đăng TikTok.
 */
export default function NewsBroadcastPlayer({
  scenes,
  fallbackImage,
  title,
  sourceName,
}: NewsBroadcastPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [clock, setClock] = useState('');
  const timerRef = useRef<number | null>(null);
  const { voice, supported, hasVietnamese } = useVietnameseVoice();

  const scene = scenes[index];
  const total = scenes.length;

  useEffect(() => {
    const tick = () =>
      setClock(
        new Intl.DateTimeFormat('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date()),
      );
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopSpeech = useCallback(() => {
    clearTimer();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [clearTimer]);

  useEffect(() => stopSpeech, [stopSpeech]);

  useEffect(() => {
    if (!playing || !scene) return;

    const next = () => {
      if (index + 1 < total) {
        setIndex((i) => i + 1);
      } else {
        setPlaying(false);
        setIndex(0);
      }
    };

    const text = scene.narration;

    if (muted || !supported) {
      timerRef.current = window.setTimeout(next, 3800);
      return clearTimer;
    }

    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'vi-VN';
    utt.rate = 0.98;
    utt.pitch = 1;
    if (voice) utt.voice = voice;
    utt.onend = next;

    // Không có giọng vi-VN thì onend đôi khi không bắn; hẹn giờ dự phòng theo
    // độ dài chữ để bản tin không đứng hình giữa chừng.
    timerRef.current = window.setTimeout(
      next,
      Math.max(4000, text.length * 95),
    );

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);

    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, index, muted, voice, supported]);

  if (total === 0) return null;

  const image = scene?.imageUrl || fallbackImage;

  const toggle = () => {
    if (playing) stopSpeech();
    setPlaying((p) => !p);
  };

  const restart = () => {
    stopSpeech();
    setIndex(0);
    setPlaying(true);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-ddms-bg-card">
      {/* ----- Trường quay ----- */}
      <div className="relative aspect-video overflow-hidden bg-[#0a1628]">
        {/* Phông nền studio */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,#123a5e_0%,#0a1628_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(180deg,transparent,#061020)]" />

        {/* Màn hình sau lưng MC */}
        <div className="absolute right-[4%] top-[8%] h-[52%] w-[52%] overflow-hidden rounded-lg border-2 border-cyan-400/30 shadow-2xl">
          {image ? (
            <img
              key={image}
              src={image}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-slate-800" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
        </div>

        {/* Bàn dẫn */}
        <div className="absolute inset-x-0 bottom-0 h-[22%] bg-[linear-gradient(180deg,#16324f,#0d1f33)] shadow-[0_-8px_24px_rgba(0,0,0,0.5)]" />

        {/* Đèn nền hắt sau người dẫn, tách khỏi phông tối */}
        <div className="absolute bottom-[10%] left-[2%] h-[62%] w-[34%] rounded-full bg-cyan-400/15 blur-3xl" />

        {/* Người dẫn */}
        <NewsAnchor
          speaking={playing && !muted}
          className="absolute bottom-[6%] left-[6%] h-[76%] w-auto drop-shadow-2xl"
        />

        {/* Logo kênh */}
        <div className="absolute left-4 top-4 rounded bg-cyan-500/90 px-2.5 py-1 text-[11px] font-black tracking-wider text-[#06202f]">
          DDMS TIN TỨC
        </div>

        {/* Đồng hồ + trạng thái */}
        <div className="absolute right-4 top-4 flex items-center gap-2">
          {playing && (
            <span className="flex items-center gap-1 rounded bg-red-600 px-2 py-1 text-[10px] font-bold text-white">
              <span className="size-1.5 animate-pulse rounded-full bg-white" />
              ĐANG PHÁT
            </span>
          )}
          <span className="rounded bg-black/60 px-2 py-1 text-[11px] font-semibold text-white">
            {clock}
          </span>
        </div>

        {/* Thanh chữ dưới — kiểu bản tin truyền hình */}
        {scene?.caption && (
          <div className="absolute inset-x-0 bottom-[22%] flex items-stretch">
            <div className="bg-red-600 px-3 py-2 text-[11px] font-black text-white sm:text-xs">
              TIN MỚI
            </div>
            <div className="flex-1 bg-[#0d2b45]/95 px-3 py-2">
              <p className="line-clamp-2 text-sm font-bold leading-snug text-white sm:text-lg">
                {scene.caption}
              </p>
            </div>
          </div>
        )}

        {/* Chữ chạy */}
        <div className="absolute inset-x-0 bottom-0 overflow-hidden border-t border-cyan-400/20 bg-[#061020]/90 py-1.5">
          <div className="ddms-ticker whitespace-nowrap text-[11px] font-medium text-cyan-100">
            {`${title}`}
            {sourceName ? `  ·  Nguồn: ${sourceName}` : ''}
            {'  ·  DDMS — Nền tảng đặt tour du thuyền Đà Nẵng  ·  '}
            {`${title}`}
          </div>
        </div>

        {/* Nút phát lớn khi đang dừng */}
        {!playing && (
          <button
            type="button"
            onClick={restart}
            aria-label="Phát bản tin"
            className="absolute inset-0 flex items-center justify-center bg-black/30"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-[#0a1628] shadow-xl transition-transform hover:scale-105">
              <Play size={26} className="ml-1" fill="currentColor" />
            </span>
          </button>
        )}

        {/* Tiến độ cảnh */}
        <div className="absolute inset-x-0 top-0 flex gap-1 p-1.5">
          {scenes.map((_, i) => (
            <span
              key={i}
              className={`h-0.5 flex-1 rounded-full ${
                i <= index ? 'bg-cyan-300' : 'bg-white/25'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ----- Điều khiển ----- */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="flex size-9 items-center justify-center rounded-full bg-ddms-secondary/15 text-ddms-secondary transition-colors hover:bg-ddms-secondary/25"
            aria-label={playing ? 'Tạm dừng' : 'Phát'}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            type="button"
            onClick={restart}
            className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Phát lại từ đầu"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            aria-label={muted ? 'Bật giọng đọc' : 'Tắt giọng đọc'}
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <span className="ml-1 text-xs text-muted-foreground">
            Cảnh {index + 1}/{total}
          </span>
        </div>

        {supported && !hasVietnamese && (
          <span className="text-[11px] text-amber-600 dark:text-amber-400">
            Máy chưa có giọng tiếng Việt — bản tin vẫn chạy nhưng đọc bằng giọng
            mặc định
          </span>
        )}
        {!supported && (
          <span className="text-[11px] text-muted-foreground">
            Trình duyệt không hỗ trợ giọng đọc
          </span>
        )}
      </div>
    </div>
  );
}
