// =====================================================================
// VowPathMark — the living Vow Path logo. Three concentric "vault door"
// arcs with staggered gold tracers sweeping open, around the housed
// flame. theme controls the flame core (white-hot on dark, ember on light).
// Scales via the `size` prop (fixed viewBox). For nav tabs + Vow Path headers.
// =====================================================================
export default function VowPathMark({ size = 28, theme = 'dark' }) {
  const core = theme === 'dark' ? '#FAF7F1' : '#C5572C'
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      {/* Threshold */}
      <line x1="5" y1="94" x2="95" y2="94" stroke="#6B5C4A" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

      {/* Three vault doors (static) */}
      <path d="M 10 94 L 10 45 A 40 40 0 0 1 90 45 L 90 94" fill="none" stroke="#6B5C4A" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
      <path d="M 22 94 L 22 45 A 28 28 0 0 1 78 45 L 78 94" fill="none" stroke="#6B5C4A" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
      <path d="M 34 94 L 34 45 A 16 16 0 0 1 66 45 L 66 94" fill="none" stroke="#6B5C4A" strokeWidth="2" strokeLinecap="round" opacity="0.25" />

      {/* Animated tracers (staggered begin times) */}
      <path d="M 10 94 L 10 45 A 40 40 0 0 1 90 45 L 90 94" fill="none" stroke="#854F0B" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="240" strokeDashoffset="240">
        <animate attributeName="stroke-dashoffset" values="240; -240" dur="3.2s" begin="0s" repeatCount="indefinite" />
      </path>
      <path d="M 22 94 L 22 45 A 28 28 0 0 1 78 45 L 78 94" fill="none" stroke="#B89456" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="200" strokeDashoffset="200">
        <animate attributeName="stroke-dashoffset" values="200; -200" dur="3.2s" begin="0.3s" repeatCount="indefinite" />
      </path>
      <path d="M 34 94 L 34 45 A 16 16 0 0 1 66 45 L 66 94" fill="none" stroke="#D9B57A" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="160" strokeDashoffset="160">
        <animate attributeName="stroke-dashoffset" values="160; -160" dur="3.2s" begin="0.6s" repeatCount="indefinite" />
      </path>

      {/* The housed flame */}
      <g transform="translate(20, 39) scale(0.6)">
        <path d="M50 15 Q70 50 50 90 Q30 50 50 15" fill="#854F0B" opacity="0.8">
          <animate attributeName="d" values="M50 15 Q70 50 50 90 Q30 50 50 15; M45 20 Q75 45 50 90 Q25 55 45 20; M55 20 Q65 55 50 90 Q35 45 55 20; M50 15 Q70 50 50 90 Q30 50 50 15" dur="1.8s" repeatCount="indefinite" />
        </path>
        <path d="M50 35 Q65 65 50 90 Q35 65 50 35" fill="#D9B57A">
          <animate attributeName="d" values="M50 35 Q65 65 50 90 Q35 65 50 35; M52 30 Q60 60 50 90 Q30 70 52 30; M48 30 Q70 70 50 90 Q40 60 48 30; M50 35 Q65 65 50 90 Q35 65 50 35" dur="1.2s" repeatCount="indefinite" />
        </path>
        <path d="M50 55 Q55 75 50 90 Q45 75 50 55" fill={core}>
          <animate attributeName="d" values="M50 55 Q55 75 50 90 Q45 75 50 55; M48 50 Q58 70 50 90 Q42 70 48 50; M50 55 Q55 75 50 90 Q45 75 50 55" dur="0.8s" repeatCount="indefinite" />
        </path>
      </g>
    </svg>
  )
}