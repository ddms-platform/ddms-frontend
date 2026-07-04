import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { startBackgroundAudio } from '@/lib/audio-manager';

import winterVideo from '@/assets/12680908_1920_1080_30fps.mp4';

const SESSION_KEY = 'ddms-splash-dismissed';

export default function WelcomeSplash() {
  const { t } = useTranslation();

  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  });
  const [fadeOut, setFadeOut] = useState(false);

  // Prevent body scroll while splash is visible
  useEffect(() => {
    if (!dismissed) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [dismissed]);

  if (dismissed) return null;

  const handleEnter = () => {
    // This click IS a valid user gesture → audio will play
    startBackgroundAudio();
    setFadeOut(true);
    setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setDismissed(true);
    }, 800);
  };

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center transition-opacity duration-700 ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={winterVideo}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/40 to-black/80" />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-2 animate-[fadeInDown_0.8s_ease-out]">
          <svg
            className="w-14 h-14 md:w-18 md:h-18"
            style={{ color: '#E31C24' }}
            viewBox="0 0 100 80"
            fill="none"
            stroke="currentColor"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 15v50c0 0 20 0 20-25S15 15 15 15z" />
            <path d="M25 25v30c0 0 20 0 20-15s-20-15-20-15z" />
            <path d="M45 40c10-20 25-20 25 0s15 20 15 0" />
          </svg>
          <span className="text-4xl md:text-5xl font-semibold tracking-tight uppercase text-white">
            ddms
          </span>
        </div>

        {/* Tagline */}
        <p className="text-white/80 text-lg md:text-xl max-w-md leading-relaxed font-light animate-[fadeInUp_0.8s_ease-out_0.3s_both]">
          {t('splash.tagline', 'Discover the beauty of Da Nang on the water')}
        </p>

        {/* Enter button */}
        <button
          onClick={handleEnter}
          className="group relative mt-4 px-10 py-4 rounded-full border-2 border-white/40 text-white font-medium text-lg
                     overflow-hidden cursor-pointer
                     transition-all duration-500 hover:border-white/80 hover:scale-105
                     animate-[fadeInUp_0.8s_ease-out_0.6s_both]"
        >
          {/* Gradient fill on hover */}
          <span className="absolute inset-0 bg-linear-to-r from-red-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
          <span className="relative z-10 flex items-center gap-2">
            {t('splash.enter', 'Khám phá ngay')}
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </span>
        </button>
      </div>

      {/* Bottom gradient line decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-red-500 to-transparent opacity-60" />
    </div>
  );
}
