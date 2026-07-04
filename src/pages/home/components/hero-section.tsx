import { useState, useRef, useEffect } from 'react';
import {
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import springVideo from '@/assets/15040488_1920_1080_30fps.mp4';
import summerVideo from '@/assets/12742203-hd_1920_1080_24fps.mp4';
import autumnVideo from '@/assets/15693482-hd_1920_1080_24fps.mp4';
import winterVideo from '@/assets/12680908_1920_1080_30fps.mp4';
import helloVietnam from '@/assets/Hello Vietnam.mp3';

interface MonthData {
  key: string;
  label: string;
  shortLabelVN: string;
  shortLabelEN: string;
  title: string;
  desc: string;
  video: string;
}

const MONTHS: MonthData[] = [
  {
    key: 'mar',
    label: 'Tháng 3 (Xuân)',
    shortLabelVN: 'Tháng 3',
    shortLabelEN: 'Mar',
    title: 'Du thuyền Sông Hàn Ngày Xuân',
    desc: 'Tận hưởng bầu trời trong lành, nắng ấm ban mai cùng hải trình ngoạn cảnh sông Hàn thanh bình.',
    video: springVideo,
  },
  {
    key: 'jun',
    label: 'Tháng 6 (Hè)',
    shortLabelVN: 'Tháng 6',
    shortLabelEN: 'Jun',
    title: 'Đêm Lễ Hội Pháo Hoa DIFF',
    desc: 'Chiêm ngưỡng những màn trình diễn pháo hoa quốc tế rực rỡ sắc màu ngay từ boong du thuyền thượng lưu.',
    video: summerVideo,
  },
  {
    key: 'sep',
    label: 'Tháng 9 (Thu)',
    shortLabelVN: 'Tháng 9',
    shortLabelEN: 'Sep',
    title: 'Hoàng Hôn Vịnh Đà Nẵng',
    desc: 'Say đắm trong sắc vàng tím thơ mộng của chiều tà khi du thuyền buồm lướt gió khơi vịnh Đà Nẵng.',
    video: autumnVideo,
  },
  {
    key: 'dec',
    label: 'Tháng 12 (Đông)',
    shortLabelVN: 'Tháng 12',
    shortLabelEN: 'Dec',
    title: 'Thành Phố Ánh Sáng Đêm Đông',
    desc: 'Hành trình ngắm nhìn toàn cảnh thành phố lung linh ánh đèn phản chiếu kỳ ảo dưới dòng nước trôi lững lờ.',
    video: winterVideo,
  },
];

export default function HeroSection() {
  const { t } = useTranslation();
  const [activeMonth, setActiveMonth] = useState('sep');
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // refs for calculating the sliding underline offset dynamically
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 });

  useEffect(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.pause();
      } else {
        const playAudio = () => {
          audioRef.current?.play().catch((err) => {
            console.warn(
              'Playback blocked by browser auto-play restrictions:',
              err,
            );
          });
        };
        playAudio();
        // Play on first user interaction if blocked initially by browser policy
        window.addEventListener('click', playAudio, { once: true });
        window.addEventListener('keydown', playAudio, { once: true });
        return () => {
          window.removeEventListener('click', playAudio);
          window.removeEventListener('keydown', playAudio);
        };
      }
    }
  }, [isMuted]);

  useEffect(() => {
    const activeBtn = buttonRefs.current[activeMonth];
    if (activeBtn) {
      setUnderlineStyle({
        width: activeBtn.offsetWidth,
        left: activeBtn.offsetLeft,
      });
    }
  }, [activeMonth, t]);

  const handlePrevMonth = () => {
    const currentIndex = MONTHS.findIndex((m) => m.key === activeMonth);
    const prevIndex = (currentIndex - 1 + MONTHS.length) % MONTHS.length;
    setActiveMonth(MONTHS[prevIndex].key);
  };

  const handleNextMonth = () => {
    const currentIndex = MONTHS.findIndex((m) => m.key === activeMonth);
    const nextIndex = (currentIndex + 1) % MONTHS.length;
    setActiveMonth(MONTHS[nextIndex].key);
  };

  return (
    <section className="relative overflow-hidden h-screen flex items-center select-none bg-black">
      {/* ── Background Video Container ── */}
      <div className="absolute inset-0 overflow-hidden z-0 bg-black">
        <audio ref={audioRef} src={helloVietnam} loop />
        {MONTHS.map((m) => {
          const isActive = m.key === activeMonth;
          return (
            <video
              key={m.key}
              src={m.video}
              autoPlay
              loop
              muted
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            />
          );
        })}
      </div>

      {/* ── Main Hero Content ── */}
      <div className="relative mx-auto max-w-7xl w-full px-6 py-24 md:py-32 z-20 flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl">
          <h1
            className="text-4xl font-light leading-tight tracking-tight text-white md:text-5xl lg:text-7xl md:whitespace-nowrap animate-hero-title"
            style={{ letterSpacing: '-0.44px' }}
          >
            {t('home.hero.welcome')}
          </h1>
          <p className="mt-4 text-xs md:text-sm font-medium uppercase tracking-widest text-slate-300/90 mx-auto animate-hero-subtext">
            {t('home.hero.explore')}
          </p>
        </div>
      </div>

      {/* ── Bottom Left Timeline Navigation ── */}
      <div className="absolute bottom-10 left-6 md:left-16 z-30 flex items-center gap-4 md:gap-6 text-white animate-timeline select-none filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.85)]">
        {/* Grid Icon */}
        <button className="text-white hover:opacity-90 cursor-pointer bg-transparent border-none p-0 transition-all">
          <LayoutGrid size={26} />
        </button>

        {/* Navigation Controls */}
        <div className="flex items-center gap-3 md:gap-5">
          <button
            onClick={handlePrevMonth}
            className="text-white hover:opacity-90 cursor-pointer bg-transparent border-none p-0 transition-all"
            aria-label="Previous month"
          >
            <ChevronLeft size={26} />
          </button>

          <div className="flex items-center gap-4 md:gap-6 relative py-1">
            {/* Sliding Active Underline */}
            <span
              className="absolute bottom-0 h-1 bg-ddms-secondary rounded-full transition-all duration-300 ease-out-sine"
              style={{
                width: `${underlineStyle.width}px`,
                left: `${underlineStyle.left}px`,
              }}
            />

            {MONTHS.map((m) => (
              <button
                key={m.key}
                ref={(el) => {
                  buttonRefs.current[m.key] = el;
                }}
                onClick={() => setActiveMonth(m.key)}
                className={`text-2xl font-light transition-all cursor-pointer relative py-1 bg-transparent border-none p-0 text-white ${
                  activeMonth === m.key
                    ? 'text-white font-medium text-3xl'
                    : 'hover:opacity-85'
                }`}
              >
                <span>{t(`home.timeline.${m.key}.shortLabel`)}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleNextMonth}
            className="text-white/85 hover:text-white cursor-pointer bg-transparent border-none p-0 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      {/* ── Bottom Right Sound Control ── */}
      <div className="absolute bottom-10 right-6 md:right-16 z-30 flex items-center gap-3 animate-timeline select-none filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.85)]">
        <button
          onClick={() => setIsMuted((prev) => !prev)}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10 hover:border-white transition-all active:scale-95 bg-black/10 backdrop-blur-xs"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Entrance Animations Keyframes */}
      <style>{`
        @keyframes heroSlideUp {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes heroFadeOut {
          to { transform: translateY(-15px); opacity: 0; visibility: hidden; }
        }
        @keyframes timelineSlideUp {
          from { transform: translateY(30px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        .animate-hero-title {
          opacity: 0;
          animation: heroSlideUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards,
                     heroFadeOut 0.8s cubic-bezier(0.16, 1, 0.3, 1) 5s forwards;
        }
        .animate-hero-subtext {
          opacity: 0;
          animation: heroSlideUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.35s forwards,
                     heroFadeOut 0.8s cubic-bezier(0.16, 1, 0.3, 1) 5.1s forwards;
        }
        .animate-timeline {
          opacity: 0;
          animation: timelineSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.75s forwards;
        }
      `}</style>
    </section>
  );
}
