// =====================================================================
// AnimatedVowFlame — the living flame logo (path-morphing SVG).
// Scales cleanly via the `size` prop since the viewBox is fixed at 100.
// Drop it anywhere the Vow mark appears. Reads best on dark surfaces;
// the cream inner spark loses contrast on very light backgrounds.
// =====================================================================
export default function AnimatedVowFlame({ size = 32, theme = 'dark' }) {
  // White-hot core on dark surfaces, ember-hot core on light surfaces
  const innerSparkColor = theme === 'dark' ? '#FAF7F1' : '#C5572C'
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      {/* Back flame (clay, slow movement) */}
      <path d="M50 15 Q70 50 50 90 Q30 50 50 15" fill="#854F0B" opacity="0.8">
        <animate attributeName="d" values="M50 15 Q70 50 50 90 Q30 50 50 15; M45 20 Q75 45 50 90 Q25 55 45 20; M55 20 Q65 55 50 90 Q35 45 55 20; M50 15 Q70 50 50 90 Q30 50 50 15" dur="1.8s" repeatCount="indefinite" />
      </path>
      {/* Core flame (gold, fast movement) */}
      <path d="M50 35 Q65 65 50 90 Q35 65 50 35" fill="#D9B57A">
        <animate attributeName="d" values="M50 35 Q65 65 50 90 Q35 65 50 35; M52 30 Q60 60 50 90 Q30 70 52 30; M48 30 Q70 70 50 90 Q40 60 48 30; M50 35 Q65 65 50 90 Q35 65 50 35" dur="1.2s" repeatCount="indefinite" />
      </path>
      {/* Inner hot spark (dynamic: white-hot / ember-hot) */}
      <path d="M50 55 Q55 75 50 90 Q45 75 50 55" fill={innerSparkColor}>
        <animate attributeName="d" values="M50 55 Q55 75 50 90 Q45 75 50 55; M48 50 Q58 70 50 90 Q42 70 48 50; M50 55 Q55 75 50 90 Q45 75 50 55" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  )
}