import { useEffect, useState } from 'react'

// ===================================================================
// JAR COUNTER — the filling-jars clock, compact.
// ===================================================================
// Extracted from the old Endure hero: six jars (years · months · days
// over hours · mins · secs), each filling toward its next unit — the
// seconds jar rises smoothly on a fast tick. Same decomposition math
// as the original (365/30 split; the days jar fills against the real
// length of the current month). Light-surface variant, sized to sit
// under the tree. Purely presentational: give it a start ISO string.
// ===================================================================

function Jar({ n, u, fill, accent, hideIfZero }) {
  const hidden = hideIfZero && (!n || n === 0 || n === '00')
  return (
    <div style={S.jar}>
      {!hidden && (
        <div style={{
          ...S.fill,
          height: `${Math.min(fill || 0, 100)}%`,
          background: accent
            ? 'linear-gradient(180deg, rgba(197,87,44,0.22) 0%, rgba(197,87,44,0.48) 100%)'
            : 'linear-gradient(180deg, rgba(217,151,80,0.18) 0%, rgba(197,109,44,0.38) 100%)',
        }} />
      )}
      <div style={S.content}>
        {hidden ? (
          <p style={{ ...S.u, marginTop: 10 }}>—</p>
        ) : (
          <>
            <p style={{ ...S.n, ...(accent ? S.nAccent : {}) }}>{n}</p>
            <p style={S.u}>{u}</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function JarCounter({ startISO }) {
  const [, setTick] = useState(0)

  // fast tick so the seconds jar fills smoothly
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 250)
    return () => clearInterval(id)
  }, [])

  if (!startISO) return null
  const startDate = new Date(startISO)
  const now = new Date()
  let total = Math.floor((now - startDate) / 1000)
  if (total < 0) total = 0
  const secs = total % 60; total = Math.floor(total / 60)
  const mins = total % 60; total = Math.floor(total / 60)
  const hours = total % 24; total = Math.floor(total / 24)
  const totalDays = total
  const years = Math.floor(totalDays / 365)
  const remAfterY = totalDays - years * 365
  const months = Math.floor(remAfterY / 30)
  const days = remAfterY - months * 30

  const pad = (n) => String(n).padStart(2, '0')
  const ms = now.getMilliseconds()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const yFill = (years / 10) * 100
  const moFill = (months / 12) * 100
  const dFill = (days / daysInMonth) * 100
  const hFill = (hours / 24) * 100
  const miFill = (mins / 60) * 100
  const sFill = ((secs * 1000 + ms) / 60000) * 100

  const sinceStr = startDate.toLocaleString(undefined, {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div style={S.wrap}>
      <div style={S.grid}>
        <Jar n={years} u={years === 1 ? 'year' : 'years'} fill={yFill} hideIfZero />
        <Jar n={months} u="months" fill={moFill} />
        <Jar n={days} u="days" fill={dFill} />
        <Jar n={pad(hours)} u="hours" fill={hFill} />
        <Jar n={pad(mins)} u="mins" fill={miFill} />
        <Jar n={pad(secs)} u="secs" fill={sFill} accent />
      </div>
      <p style={S.since}>Since {sinceStr}</p>
    </div>
  )
}

const S = {
  wrap: { margin: '10px auto 0', maxWidth: 320 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 },
  jar: {
    position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F6EFDD 100%)',
    border: '0.5px solid #ECE2CD', borderRadius: 11,
    padding: '9px 3px 8px', textAlign: 'center', minHeight: 46,
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.7), 0 1px 2px rgba(120,80,30,0.04)',
  },
  fill: { position: 'absolute', bottom: 0, left: 0, right: 0, transition: 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1)', pointerEvents: 'none', zIndex: 0 },
  content: { position: 'relative', zIndex: 1 },
  n: { fontSize: 18, fontWeight: 500, color: '#2A1F15', lineHeight: 1, margin: 0, fontFamily: 'Georgia, serif', fontVariantNumeric: 'tabular-nums' },
  nAccent: { color: '#C5572C' },
  u: { fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9C8C78', margin: '4px 0 0' },
  since: { fontSize: 11, color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', margin: '7px 0 0' },
}