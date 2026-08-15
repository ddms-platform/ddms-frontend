import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import type { VideoScene } from '@/services/blogService';

interface ArticleVideoPlayerProps {
  scenes: VideoScene[];
  /** Ảnh dùng khi cảnh không có ảnh riêng. */
  fallbackImage?: string | null;
  title: string;
}

/**
 * "Video" bài viết dựng ngay trên trình duyệt: slideshow ảnh + phụ đề, kèm
 * giọng đọc bằng Web Speech API.
 *
 * Cố ý không render MP4 trên server — như vậy sẽ phải cài ffmpeg và một dịch vụ
 * TTS trên EC2. Đổi lại, cách này không xuất được file để đăng TikTok.
 *
 * Giọng tiếng Việt phụ thuộc trình duyệt: Chrome và Edge trên Windows có sẵn,
 * một số máy không có thì vẫn chạy slideshow, chỉ mất phần đọc.
 */
export default function ArticleVideoPlayer({
  scenes,
  fallbackImage,
  title,
}: ArticleVideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(true);
  const timerRef = useRef<number | null>(null);

  const scene = scenes[index];
  const total = scenes.length;

  useEffect(() => {
    setSpeechAvailable(
      typeof window !== 'undefined' && 'speechSynthesis' in window,
    );
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  /** Đọc lời thoại; gọi onDone khi đọc xong hoặc khi không đọc được. */
  const speak = (text: string, onDone: () => void) => {
    if (muted || !speechAvailable) {
      timerRef.current = window.setTimeout(onDone, 3500);
      return;
    }

    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'vi-VN';
    utt.rate = 1;
    const viVoice = window.speechSynthesis
      .getVoices()
      .find((v) => v.lang?.toLowerCase().startsWith('vi'));
    if (viVoice) utt.voice = viVoice;

    utt.onend = onDone;
    // Không có giọng tiếng Việt thì onend có thể không bắn: hẹn giờ dự phòng
    // theo độ dài chữ để slideshow không đứng im.
    timerRef.current = window.setTimeout(
      onDone,
      Math.max(3500, text.length * 90),
    );

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
  };

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

    speak(scene.narration, next);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, index, muted]);

  if (total === 0) return null;

  const image = scene?.imageUrl || fallbackImage;

  const toggle = () => {
    if (playing) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (timerRef.current) window.clearTimeout(timerRef.current);
    }
    setPlaying((p) => !p);
  };

  const restart = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setIndex(0);
    setPlaying(true);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-ddms-bg-card">
      <div className="relative aspect-video bg-black">
        {image && (
          <img
            src={image}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover opacity-90 transition-opacity duration-700"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent" />

        {scene?.caption && (
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <p className="text-lg font-bold leading-snug text-white drop-shadow sm:text-2xl">
              {scene.caption}
            </p>
          </div>
        )}

        {!playing && (
          <button
            type="button"
            onClick={restart}
            aria-label="Phát video bài viết"
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-ddms-secondary shadow-xl transition-transform hover:scale-105">
              <Play size={26} className="ml-1" fill="currentColor" />
            </span>
          </button>
        )}

        <div className="absolute inset-x-0 top-0 flex gap-1 p-2">
          {scenes.map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= index ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3">
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

        {!speechAvailable && (
          <span className="text-[11px] text-muted-foreground">
            Trình duyệt không hỗ trợ giọng đọc
          </span>
        )}
      </div>
    </div>
  );
}
