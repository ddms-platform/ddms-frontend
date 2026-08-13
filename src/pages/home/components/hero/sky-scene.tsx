import dragonBridge from '@/assets/dragon-bridge.png';

interface Puff {
  size: number;
  top: number;
  left: number;
}

/** Một đám mây: thân bo tròn cộng vài khối cầu ghép lên trên cho ra hình dáng. */
const Cloud = ({
  className,
  width,
  height,
  puffs,
}: {
  className: string;
  width: number;
  height: number;
  puffs: Puff[];
}) => (
  <div
    className={`absolute rounded-full bg-white/80 blur-[1px] dark:bg-white/10 ${className}`}
    style={{ width, height }}
  >
    {puffs.map((p, i) => (
      <span
        key={i}
        className="absolute rounded-full bg-inherit"
        style={{ width: p.size, height: p.size, top: p.top, left: p.left }}
      />
    ))}
  </div>
);

/** Hải âu — ẩn ở chế độ tối vì ban đêm chim không bay. */
const Seagull = ({ className }: { className: string }) => (
  <div className={`absolute opacity-80 dark:hidden ${className}`}>
    <svg width="46" height="18" viewBox="0 0 46 18" fill="none">
      <path
        className="ddms-anim-flap origin-center"
        d="M2 14 Q12 2 23 12 Q34 2 44 14"
        stroke="#5b6b73"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  </div>
);

/**
 * Bầu trời phía trên đường chân trời: mặt trời ban ngày hoá thành mặt trăng khi
 * sang chế độ tối, kèm mây trôi, hải âu và cầu Rồng làm mốc nhận diện Đà Nẵng.
 */
export default function SkyScene() {
  return (
    <>
      {/* Trời sao — chỉ hiện ở chế độ tối */}
      <div className="ddms-stars pointer-events-none absolute inset-0 hidden dark:block" />

      {/* Màn hình hẹp: dạt hẳn ra mép phải và thu nhỏ, vì lúc đó khối chữ trải
          gần hết chiều ngang — để nguyên vị trí như desktop sẽ đè lên badge. */}
      <div
        className="ddms-anim-sun absolute top-[14%] right-[3%] size-16 rounded-full
                   bg-[radial-gradient(circle,#fff3d6_0%,#ffd98a_55%,#ffb45c_100%)]
                   md:top-[14%] md:right-[15%] md:size-22
                   dark:bg-[radial-gradient(circle_at_35%_35%,#fbfcf4_0%,#e6e8de_55%,#c6cabe_100%)]
                   dark:shadow-[0_0_44px_20px_rgba(210,225,255,.22)]"
      />

      <Cloud
        className="ddms-anim-cloud-1 top-[16%] -left-45"
        width={160}
        height={42}
        puffs={[
          { size: 70, top: -32, left: 26 },
          { size: 50, top: -20, left: 84 },
        ]}
      />
      <Cloud
        className="ddms-anim-cloud-2 top-[30%] -left-60 opacity-60"
        width={210}
        height={50}
        puffs={[
          { size: 90, top: -40, left: 34 },
          { size: 60, top: -24, left: 116 },
        ]}
      />
      <Cloud
        className="ddms-anim-cloud-3 top-[8%] -left-35 opacity-50"
        width={120}
        height={34}
        puffs={[
          { size: 54, top: -24, left: 20 },
          { size: 40, top: -16, left: 62 },
        ]}
      />

      <Seagull className="ddms-anim-gull-1 top-[22%]" />
      <Seagull className="ddms-anim-gull-2 top-[27%] scale-75" />

      {/* Cầu Rồng đặt ngay trên đường chân trời (biển chiếm 30% chiều cao hero) */}
      <img
        src={dragonBridge}
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-[calc(30%-98px)] left-1/2 h-auto
                   w-[min(870px,90vw)] -translate-x-1/2 dark:brightness-75 dark:saturate-[.85]"
      />
    </>
  );
}
