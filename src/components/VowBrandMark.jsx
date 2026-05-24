import AnimatedVowFlame from './AnimatedVowFlame'

// =====================================================================
// VowBrandMark — the living flame next to the "Vow" wordmark.
// Drop into any top nav. theme="light" (dark text on cream) is default;
// theme="dark" (cream text) for dark surfaces. Wordmark scales with size.
// =====================================================================
export default function VowBrandMark({ size = 20, theme = 'light' }) {
  const color = theme === 'dark' ? '#FAF7F1' : '#2A1F15'
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
      <AnimatedVowFlame size={size} theme={theme} />
      <span
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: `${Math.round(size * 0.95)}px`,
          fontWeight: 500,
          color,
          letterSpacing: '-0.01em',
          lineHeight: 1,
        }}
      >
        Vow
      </span>
    </div>
  )
}