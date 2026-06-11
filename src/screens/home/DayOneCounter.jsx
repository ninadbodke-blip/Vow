import { useEffect, useState } from 'react'

// ===================================================================
// DAY ONE COUNTER — the old home's reverse counter, kept.
// ===================================================================
// Dark tile, gold eyebrow, the chosen date in serif, and the four
// cells counting down: days · hrs · mins · secs. Self-ticking.
// Presentational — give it a target ISO date and an onChange handler
// for the "Change the day" affordance.
// ===================================================================

export default function DayOneCounter({ targetISO, onChange }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  if (!targetISO) return null
  const target = new Date(`${targetISO}T00:00:00`)
  const now = new Date()
  let totalMs = target.getTime() - now.getTime()
  const arrived = totalMs <= 0
  if (totalMs < 0) totalMs = 0

  const totalSecs = Math.floor(totalMs / 1000)
  const days = Math.floor(totalSecs / 86400)
  const hours = Math.floor((totalSecs % 86400) / 3600)
  const mins = Math.floor((totalSecs % 3600) / 60)
  const secs = totalSecs % 60
  const pad = (n) => String(n).padStart(2, '0')

  const dateStr = target.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })

  if (arrived) {
    return (
      <div style={S.tile}>
        <p style={S.eyebrow}>Day one</p>
        <h2 style={S.date}>It has arrived.</h2>
        <p style={S.micro}>{dateStr} — the day you chose. Begin from the wayfinder above, or move the day.</p>
        {onChange && <button onClick={onChange} style={S.change}>Move the day</button>}
      </div>
    )
  }

  return (
    <div style={S.tile}>
      <p style={S.eyebrow}>Day one</p>
      <h2 style={S.date}>{dateStr}</h2>
      <div style={S.divider} />
      <div style={S.grid}>
        <div style={S.cell}><p style={S.n}>{days}</p><p style={S.u}>days</p></div>
        <div style={S.cell}><p style={S.n}>{pad(hours)}</p><p style={S.u}>hrs</p></div>
        <div style={S.cell}><p style={S.n}>{pad(mins)}</p><p style={S.u}>mins</p></div>
        <div style={S.cell}><p style={S.n}>{pad(secs)}</p><p style={S.u}>secs</p></div>
      </div>
      <p style={S.micro}>Use these days to clear the path. Every move now is one less fight then.</p>
      {onChange && <button onClick={onChange} style={S.change}>Change the day</button>}
    </div>
  )
}

const S = {
  tile: {
    maxWidth: 320, margin: '12px auto 0',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    borderRadius: 18, padding: '18px 18px 14px',
    boxShadow: '0 8px 24px -8px rgba(40,25,10,0.45)',
    textAlign: 'center', pointerEvents: 'auto',
  },
  eyebrow: { fontSize: 9.5, color: '#D9B57A', textTransform: 'uppercase', letterSpacing: '0.28em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 8px' },
  date: { fontSize: 17, color: '#FAF7F1', fontFamily: 'Georgia, serif', fontWeight: 500, margin: 0, lineHeight: 1.3 },
  divider: { height: 1, background: 'rgba(217,181,122,0.25)', margin: '12px 0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 },
  cell: { padding: '2px 0' },
  n: { fontSize: 21, color: '#EFDCAF', fontFamily: 'Georgia, serif', lineHeight: 1, margin: 0, fontVariantNumeric: 'tabular-nums' },
  u: { fontSize: 8.5, color: 'rgba(217,181,122,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '4px 0 0' },
  micro: { fontSize: 11, color: '#CBBA98', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.5, margin: '11px 0 0' },
  change: { background: 'transparent', border: 'none', color: '#D9B57A', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11.5, textDecoration: 'underline', textUnderlineOffset: 2, cursor: 'pointer', marginTop: 9, padding: 0 },
}