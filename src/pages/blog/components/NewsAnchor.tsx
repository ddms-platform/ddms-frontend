import { useEffect, useState } from 'react';

interface NewsAnchorProps {
  /** Đang đọc thì miệng mấp máy. */
  speaking: boolean;
  className?: string;
}

/**
 * Người dẫn bản tin, vẽ bằng SVG.
 *
 * Cố ý không dùng ảnh người thật: đặt mặt một người có thật lên nội dung do AI
 * viết là mạo danh, kể cả ảnh stock miễn phí. Vẽ nhân vật thì không vướng bản
 * quyền, không mạo danh ai, và điều khiển được khẩu hình theo lời đọc.
 */
export default function NewsAnchor({ speaking, className }: NewsAnchorProps) {
  const [mouthOpen, setMouthOpen] = useState(0);
  const [blink, setBlink] = useState(false);

  // Khẩu hình: đổi độ mở ngẫu nhiên khi đang đọc để trông như đang nói,
  // không cố khớp âm vị vì Web Speech API không cho biết đang đọc tới đâu.
  useEffect(() => {
    if (!speaking) {
      // Dat qua callback de khong goi setState trong than effect.
      const reset = window.setTimeout(() => setMouthOpen(0), 0);
      return () => window.clearTimeout(reset);
    }
    const id = window.setInterval(
      () => setMouthOpen(Math.random() * 0.9 + 0.1),
      130,
    );
    return () => window.clearInterval(id);
  }, [speaking]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setBlink(true);
      window.setTimeout(() => setBlink(false), 140);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  const mouthHeight = 2 + mouthOpen * 9;

  return (
    <svg
      viewBox="0 0 200 240"
      className={className}
      role="img"
      aria-label="Người dẫn bản tin"
    >
      {/* Viền sáng quanh vai: phông studio rất tối, không có viền thì thân
          người chìm hẳn vào nền. */}
      <path
        d="M20 240 Q26 176 74 160 L126 160 Q174 176 180 240 Z"
        fill="none"
        stroke="#7cc9f0"
        strokeWidth="3"
        opacity="0.5"
      />

      {/* Vai và áo vest */}
      <path
        d="M20 240 Q26 176 74 160 L126 160 Q174 176 180 240 Z"
        fill="#33507d"
      />
      <path
        d="M74 160 L100 196 L126 160 L118 156 L100 178 L82 156 Z"
        fill="#f5f7fa"
      />
      <path d="M100 196 L92 212 L100 240 L108 212 Z" fill="#c81e3c" />

      {/* Cổ */}
      <rect x="88" y="128" width="24" height="34" rx="10" fill="#e0a880" />

      {/* Đầu */}
      <ellipse cx="100" cy="94" rx="42" ry="48" fill="#f0bd93" />
      {/* Tóc */}
      <path
        d="M58 92 Q56 44 100 44 Q144 44 142 92 Q140 66 100 68 Q60 66 58 92 Z"
        fill="#2b2118"
      />

      {/* Mắt */}
      <ellipse cx="84" cy="90" rx="5" ry={blink ? 0.6 : 5} fill="#2b2118" />
      <ellipse cx="116" cy="90" rx="5" ry={blink ? 0.6 : 5} fill="#2b2118" />

      {/* Lông mày */}
      <rect x="76" y="78" width="17" height="3" rx="1.5" fill="#2b2118" />
      <rect x="107" y="78" width="17" height="3" rx="1.5" fill="#2b2118" />

      {/* Mũi */}
      <path d="M100 96 L96 108 L104 108 Z" fill="#d99b70" />

      {/* Miệng — cao thấp theo lời đọc */}
      <ellipse
        cx="100"
        cy="120"
        rx={9 + mouthOpen * 3}
        ry={mouthHeight / 2}
        fill="#8c3b46"
      />
      {mouthOpen > 0.45 && (
        <ellipse cx="100" cy="117" rx={6 + mouthOpen} ry="1.6" fill="#ffffff" />
      )}
    </svg>
  );
}
