/**
 * Du thuyền chạy ngang hero rồi lật đầu quay lại.
 *
 * Đặt z-index 2 — thấp hơn lớp sóng trước (z-3) — để phần thân dưới bị sóng che,
 * tạo cảm giác thuyền chìm trong nước thay vì dán đè lên mặt biển.
 */
export default function SailingBoat() {
  return (
    <div className="ddms-anim-sail absolute bottom-[calc(30%-44px)] left-0 z-2">
      {/* Vệt nước sau đuôi thuyền */}
      <div className="ddms-anim-wake absolute bottom-5 left-[12%] h-3.5 w-[76%] rounded-[50%] bg-white/75 blur-sm dark:bg-white/50" />

      <svg
        viewBox="0 0 360 170"
        fill="none"
        aria-hidden
        className="ddms-anim-bob relative w-52.5 drop-shadow-[0_12px_14px_rgba(20,80,110,0.3)] md:w-82.5"
      >
        {/* Vòm radar, ăng-ten và cờ hiệu */}
        <path
          d="M118,38 C124,18 148,18 154,38"
          stroke="#cfd6da"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <rect x="134" y="8" width="4" height="24" rx="2" fill="#22343f" />
        <path d="M138,8 L162,13 L138,19 Z" fill="#ff385c" />

        {/* Tầng thượng */}
        <path
          d="M96,66 L96,48 Q96,38 106,38 L192,38 L212,66 Z"
          fill="#ffffff"
        />
        <path
          d="M110,47 L186,47 L196,61 L110,61 Z"
          fill="#16313f"
          opacity=".85"
        />
        <path
          d="M132,47 L132,61 M154,47 L154,61 M176,47 L176,61"
          stroke="#ffffff"
          strokeWidth="2"
          opacity=".45"
        />

        {/* Tầng chính */}
        <path
          d="M56,102 L56,76 Q56,66 66,66 L238,66 L262,102 Z"
          fill="#fbfcfd"
        />
        <path
          d="M70,76 L236,76 L250,94 L70,94 Z"
          fill="#16313f"
          opacity=".85"
        />
        <path
          d="M100,76 L100,94 M130,76 L130,94 M160,76 L160,94 M190,76 L190,94 M220,76 L220,94"
          stroke="#ffffff"
          strokeWidth="2"
          opacity=".45"
        />

        {/* Lan can mũi thuyền */}
        <path
          d="M266,88 C290,85 312,89 334,95"
          stroke="#e8ecee"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M270,100 L270,89 M290,100 L290,88 M310,100 L310,91"
          stroke="#e8ecee"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Thân trên, sọc đỏ thương hiệu, thân dưới */}
        <path
          d="M10,102 L316,102 C334,100 346,90 356,72 C359,88 357,104 351,116 L14,116 C11,112 10,107 10,102 Z"
          fill="#f8fafb"
        />
        <path d="M13,110 L352,110 L350,117 L15,117 Z" fill="#ff385c" />
        <path
          d="M14,116 L351,116 C344,134 326,142 304,142 L58,142 C36,142 20,131 14,116 Z"
          fill="#16303e"
        />

        {/* Cửa sổ tròn — ban đêm sáng đèn vàng */}
        {[70, 102, 134, 166, 198, 230, 262].map((cx) => (
          <circle
            key={cx}
            cx={cx}
            cy="126"
            r="4"
            opacity=".9"
            className="fill-[#7fd4e8] dark:fill-[#ffd479]"
          />
        ))}
      </svg>
    </div>
  );
}
