import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import nightCruiseVideo from '@/assets/15693482-hd_1920_1080_24fps.mp4';

interface Stat {
  num: string;
  label: string;
}

/**
 * Khối video giới thiệu trải nghiệm. Video chỉ chạy khi thật sự nằm trong khung
 * nhìn và dừng lại khi cuộn qua — tránh giải mã một file HD suốt thời gian khách
 * ở những phần khác của trang.
 */
export default function ExperienceVideo() {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Trình duyệt có thể chặn autoplay; im lặng bỏ qua vì video chỉ là trang trí.
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const stats: Stat[] = [
    { num: '96', label: t('home.experience.statBoats', 'Du thuyền') },
    { num: '12k+', label: t('home.experience.statBookings', 'Lượt đặt') },
    { num: '4.9★', label: t('home.experience.statRating', 'Đánh giá') },
  ];

  return (
    <section
      id="experience"
      className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:py-22"
    >
      <p className="mb-2.5 text-[13px] font-bold tracking-[2px] text-ddms-primary uppercase">
        {t('home.experience.kicker', 'Trải nghiệm thực tế')}
      </p>
      <h2 className="mb-3 text-[clamp(26px,3.2vw,38px)] font-extrabold tracking-[-0.6px] text-foreground">
        {t('home.experience.title', 'Sông Hàn về đêm, nhìn từ boong tàu')}
      </h2>
      <p className="mb-10 max-w-155 text-base text-muted-foreground">
        {t(
          'home.experience.desc',
          'Video tự phát khi bạn cuộn tới — mỗi tour trên DDMS đều có video thực tế do chủ tàu tải lên, khách xem trước khi đặt.',
        )}
      </p>

      <div className="relative aspect-video overflow-hidden rounded-[32px] bg-[#0e2a38] shadow-[rgba(0,0,0,0.18)_0_24px_60px_-12px]">
        <video
          ref={videoRef}
          src={nightCruiseVideo}
          muted
          loop
          playsInline
          preload="metadata"
          className="size-full object-cover"
        />

        <div className="pointer-events-none absolute inset-0 flex items-end justify-between bg-linear-to-b from-transparent to-[rgba(8,30,42,0.65)] p-4 md:px-8 md:py-7">
          <span className="inline-flex items-center gap-2.5 rounded-[22px] bg-white/90 px-4.5 py-2.5 text-sm font-semibold text-[#222] backdrop-blur-sm">
            <span className="ddms-anim-live size-2.5 rounded-full bg-ddms-primary" />
            {t(
              'home.experience.liveChip',
              'Du thuyền đang hoạt động · Vịnh Đà Nẵng',
            )}
          </span>

          <div className="hidden gap-3 md:flex">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/30 bg-white/15 px-4.5 py-2.5 text-center text-white backdrop-blur-sm"
              >
                <div className="text-[19px] font-extrabold">{s.num}</div>
                <div className="text-[11px] font-medium opacity-85">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
