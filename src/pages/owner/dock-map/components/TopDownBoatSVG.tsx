const TopDownBoatSVG = ({ color }: { color: string }) => (
  <svg
    viewBox="0 0 100 280"
    className="w-8 sm:w-10 md:w-12 h-auto drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)]"
  >
    <path
      d="M 50 0 C 95 60, 90 220, 85 260 L 15 260 C 10 220, 5 60, 50 0 Z"
      fill={color}
      stroke="#ffffff"
      strokeWidth="3"
    />
    <path
      d="M 50 30 C 75 60, 75 90, 75 90 L 25 90 C 25 90, 25 60, 50 30 Z"
      fill="#e2e8f0"
    />
    <path
      d="M 20 100 L 80 100 L 75 220 L 25 220 Z"
      fill="#f8fafc"
      stroke="#94a3b8"
      strokeWidth="2"
    />
    <path
      d="M 25 105 Q 50 85, 75 105 L 70 120 Q 50 105, 30 120 Z"
      fill="#0ea5e9"
      opacity="0.8"
    />
    <rect x="25" y="220" width="50" height="35" fill="#cbd5e1" />
    <rect x="30" y="260" width="12" height="15" fill="#1e293b" rx="2" />
    <rect x="58" y="260" width="12" height="15" fill="#1e293b" rx="2" />
  </svg>
);

export default TopDownBoatSVG;
