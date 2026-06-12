import { Fragment } from 'react'

// ===================================================================
// NIGHT SKY — the tree, drawn in stars.
// ===================================================================
// The Motivation hero: the home tree's night counterpart. Each
// article truly read lights one star; gold edges assemble the tree
// from trunk to canopy as the constellation grows. A ghost of the
// day tree sits behind the stars so the shape reads at any count.
// Capacity: 50 stars. `total` is the user's visible article count,
// so adding articles later simply extends the constellation.
//
// Purely presentational: { lit, total, quote, attribution }.
// ===================================================================

// 50 star positions in lighting order (trunk → branches → canopy
// fill), each carrying the index of the earlier star it connects to.
const POINTS = [
  { x: 150, y: 182, p: -1 }, { x: 150, y: 160, p: 0 }, { x: 148, y: 136, p: 1 }, { x: 128, y: 118, p: 2 },
  { x: 168, y: 116, p: 2 }, { x: 106, y: 104, p: 3 }, { x: 192, y: 100, p: 4 }, { x: 138, y: 92, p: 3 },
  { x: 160, y: 88, p: 4 }, { x: 92, y: 84, p: 5 }, { x: 124, y: 70, p: 7 }, { x: 176, y: 66, p: 8 },
  { x: 146, y: 56, p: 7 }, { x: 108, y: 54, p: 10 }, { x: 186, y: 48, p: 11 }, { x: 132, y: 40, p: 10 },
  { x: 162, y: 36, p: 11 }, { x: 94, y: 68, p: 9 }, { x: 206, y: 80, p: 6 }, { x: 146, y: 24, p: 15 },
  { x: 76, y: 98, p: 5 }, { x: 212, y: 60, p: 14 }, { x: 118, y: 28, p: 15 }, { x: 174, y: 22, p: 16 },
  { x: 84, y: 76, p: 17 }, { x: 218, y: 72, p: 18 }, { x: 100, y: 42, p: 13 }, { x: 198, y: 38, p: 14 },
  { x: 138, y: 64, p: 12 }, { x: 158, y: 60, p: 12 }, { x: 116, y: 60, p: 10 }, { x: 170, y: 52, p: 11 },
  { x: 126, y: 50, p: 15 }, { x: 154, y: 44, p: 16 }, { x: 142, y: 34, p: 15 }, { x: 164, y: 28, p: 16 },
  { x: 130, y: 22, p: 22 }, { x: 156, y: 18, p: 19 }, { x: 104, y: 32, p: 26 }, { x: 190, y: 28, p: 27 },
  { x: 88, y: 58, p: 24 }, { x: 210, y: 46, p: 21 }, { x: 148, y: 12, p: 19 }, { x: 112, y: 18, p: 22 },
  { x: 182, y: 14, p: 23 }, { x: 96, y: 90, p: 9 }, { x: 204, y: 92, p: 18 }, { x: 134, y: 78, p: 7 },
  { x: 166, y: 76, p: 8 }, { x: 150, y: 98, p: 8 },
]

// stars that carry a small four-point sparkle cross
const SPARKLE = new Set([0, 2, 7, 11, 15, 19, 27, 33, 42, 46])

const NIGHT_CSS = `
@keyframes vowTwinkle { 0%,100% { opacity: .5; transform: scale(.9) } 50% { opacity: 1; transform: scale(1.12) } }
@keyframes vowNextPulse { 0%,100% { opacity: .15; transform: scale(.9) } 50% { opacity: .65; transform: scale(1.15) } }
@keyframes vowEdgeDraw { to { stroke-dashoffset: 0 } }
@keyframes vowNightDrift { from { transform: translateX(-320px) } to { transform: translateX(320px) } }
@keyframes vowShoot { 0% { transform: translate(0,0); opacity: 0 } 5% { opacity: 1 } 13% { transform: translate(130px,48px); opacity: 0 } 100% { transform: translate(130px,48px); opacity: 0 } }
@keyframes vowMoonGlow { 0%,100% { opacity: .45 } 50% { opacity: .8 } }
@keyframes vowFirefly { 0%,100% { transform: translate(0,0); opacity: .15 } 25% { opacity: .7 } 50% { transform: translate(9px,-7px); opacity: .25 } 75% { opacity: .65 } }
@keyframes vowCrown { 0%,100% { opacity: 0 } 50% { opacity: .18 } }
.vowSkyStar { transform-box: fill-box; transform-origin: center; animation: vowTwinkle ease-in-out infinite; }
.vowSkyNext { transform-box: fill-box; transform-origin: center; animation: vowNextPulse 2.4s ease-in-out infinite; }
.vowSkyEdge { stroke-dasharray: 60; stroke-dashoffset: 60; animation: vowEdgeDraw .9s ease forwards; }
.vowSkyCloud { animation: vowNightDrift linear infinite; }
.vowSkyShoot { animation: vowShoot 8.5s ease-in 2s infinite; }
.vowSkyMoon { animation: vowMoonGlow 6.5s ease-in-out infinite; }
.vowSkyFly { transform-box: fill-box; animation: vowFirefly ease-in-out infinite; }
.vowSkyCrown { animation: vowCrown 4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .vowSkyStar, .vowSkyNext, .vowSkyCloud, .vowSkyShoot, .vowSkyMoon, .vowSkyFly, .vowSkyCrown { animation: none !important; }
  .vowSkyEdge { stroke-dashoffset: 0; animation: none !important; }
}`

export default function NightSky({ lit = 0, total = 21, quote = '', attribution = '' }) {
  const shownTotal = Math.min(total, POINTS.length)
  const litCount = Math.max(0, Math.min(lit, shownTotal))
  const complete = shownTotal > 0 && litCount >= shownTotal
  const nextIdx = !complete ? litCount : -1

  return (
    <div style={S.sky}>
      <style>{NIGHT_CSS}</style>
      <svg style={S.art} viewBox="0 0 300 204" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="vowSkyMoonG" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#F6E8C4" /><stop offset="100%" stopColor="#E8D2A0" />
          </radialGradient>
          <linearGradient id="vowSkyTail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#EFDCAF" stopOpacity="0" /><stop offset="100%" stopColor="#EFDCAF" stopOpacity="0.95" />
          </linearGradient>
          <filter id="vowSkySoft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.1" /></filter>
        </defs>

        {/* moon with layered halo */}
        <circle className="vowSkyMoon" cx="251" cy="42" r="24" fill="rgba(239,220,175,0.10)" />
        <circle className="vowSkyMoon" style={{ animationDelay: '1.4s' }} cx="251" cy="42" r="16" fill="rgba(239,220,175,0.14)" />
        <circle cx="251" cy="42" r="11.5" fill="url(#vowSkyMoonG)" />
        <circle cx="247" cy="39" r="2.8" fill="#241710" opacity="0.12" />
        <circle cx="255" cy="46" r="2" fill="#241710" opacity="0.10" />
        <circle cx="252" cy="36.5" r="1.3" fill="#241710" opacity="0.09" />

        {/* layered cloud clusters */}
        <g className="vowSkyCloud" style={{ animationDuration: '130s' }} opacity="0.10" fill="#EFDCAF">
          <ellipse cx="140" cy="32" rx="46" ry="8" /><ellipse cx="172" cy="36" rx="30" ry="6" /><ellipse cx="116" cy="36" rx="24" ry="5" />
        </g>
        <g className="vowSkyCloud" style={{ animationDuration: '175s', animationDelay: '-70s' }} opacity="0.07" fill="#EFDCAF">
          <ellipse cx="150" cy="58" rx="38" ry="6.5" /><ellipse cx="178" cy="61" rx="22" ry="4.5" />
        </g>

        {/* far background stars */}
        <g fill="#EFDCAF">
          <circle cx="28" cy="24" r="1" opacity="0.4" /><circle cx="66" cy="44" r="1.2" opacity="0.3" /><circle cx="208" cy="20" r="1" opacity="0.35" />
          <circle cx="284" cy="88" r="1" opacity="0.3" /><circle cx="18" cy="98" r="1.1" opacity="0.35" /><circle cx="118" cy="16" r="1" opacity="0.3" />
          <circle cx="240" cy="100" r="1" opacity="0.25" /><circle cx="52" cy="70" r="0.9" opacity="0.3" />
        </g>

        {/* shooting star with tail */}
        <g className="vowSkyShoot">
          <line x1="34" y1="18" x2="58" y2="27" stroke="url(#vowSkyTail)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="58" cy="27" r="1.4" fill="#F6E8C4" />
        </g>

        {/* THE GHOST TREE — the day tree's silhouette, barely there */}
        <g fill="#EFDCAF" opacity="0.05">
          <path d="M146.5 188 L146.5 126 Q150 120 153.5 126 L153.5 188 Z" />
          <ellipse cx="150" cy="72" rx="62" ry="44" />
          <ellipse cx="112" cy="90" rx="38" ry="28" />
          <ellipse cx="188" cy="88" rx="38" ry="28" />
        </g>
        <g stroke="#EFDCAF" strokeWidth="2" opacity="0.045" fill="none" strokeLinecap="round">
          <path d="M149 132 Q132 118 112 104" /><path d="M151 130 Q170 114 190 102" />
        </g>

        {/* completion crown glow */}
        {complete && <ellipse className="vowSkyCrown" cx="150" cy="78" rx="78" ry="56" fill="#EFDCAF" />}

        {/* ground: layered mounds + grass ticks */}
        <path d="M0 188 Q150 176 300 188 L300 204 L0 204 Z" fill="#140B06" opacity="0.7" />
        <path d="M0 192 Q150 182 300 192 L300 204 L0 204 Z" fill="#0E0703" opacity="0.8" />
        <g stroke="#3A2A1C" strokeWidth="1" opacity="0.7" strokeLinecap="round">
          <line x1="92" y1="188" x2="90" y2="183" /><line x1="118" y1="186" x2="117" y2="181" />
          <line x1="186" y1="186" x2="188" y2="181" /><line x1="214" y1="188" x2="216" y2="184" />
        </g>

        {/* fireflies */}
        <circle className="vowSkyFly" style={{ animationDuration: '9s' }} cx="84" cy="166" r="1.5" fill="#E8C77F" />
        <circle className="vowSkyFly" style={{ animationDuration: '12s', animationDelay: '2s' }} cx="222" cy="158" r="1.3" fill="#E8C77F" />
        <circle className="vowSkyFly" style={{ animationDuration: '10.5s', animationDelay: '5s' }} cx="160" cy="172" r="1.2" fill="#E8C77F" />

        {/* edges between lit stars, drawn in reading order */}
        <g stroke="#C9A85C" strokeWidth="1" opacity="0.55" fill="none">
          {POINTS.slice(1, litCount).map((pt, i) => {
            const from = POINTS[pt.p]
            return (
              <line key={i} className="vowSkyEdge"
                style={{ animationDelay: `${Math.min(i * 0.08, 3).toFixed(2)}s` }}
                x1={from.x} y1={from.y} x2={pt.x} y2={pt.y} />
            )
          })}
        </g>
        {/* soft glow halos under lit stars */}
        <g filter="url(#vowSkySoft)">
          {POINTS.slice(0, litCount).map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r={(2.7 - Math.min(1.1, i * 0.022)) + 1.6} fill="#EFDCAF" opacity="0.28" />
          ))}
        </g>
        {/* lit stars + sparkle crosses */}
        <g>
          {POINTS.slice(0, litCount).map((pt, i) => {
            const r = (2.7 - Math.min(1.1, i * 0.022)).toFixed(2)
            const dur = `${(2.2 + ((i * 0.37) % 1.8)).toFixed(2)}s`
            const del = `${((i * 0.53) % 2).toFixed(2)}s`
            return (
              <Fragment key={i}>
                <circle className="vowSkyStar" style={{ animationDuration: dur, animationDelay: del }}
                  cx={pt.x} cy={pt.y} r={r} fill="#F6E8C4" />
                {SPARKLE.has(i) && (
                  <g className="vowSkyStar" style={{ animationDuration: dur, animationDelay: del }}
                    stroke="#F6E8C4" strokeWidth="0.7" opacity="0.8">
                    <line x1={pt.x - 4.5} y1={pt.y} x2={pt.x + 4.5} y2={pt.y} />
                    <line x1={pt.x} y1={pt.y - 4.5} x2={pt.x} y2={pt.y + 4.5} />
                  </g>
                )}
              </Fragment>
            )
          })}
        </g>
        {/* the next star, waiting */}
        {nextIdx >= 0 && nextIdx < POINTS.length && (
          <circle className="vowSkyNext" cx={POINTS[nextIdx].x} cy={POINTS[nextIdx].y} r="2.5" fill="#EFDCAF" />
        )}
        {/* unlit future stars, barely there */}
        <g fill="#EFDCAF" opacity="0.10">
          {POINTS.slice(nextIdx >= 0 ? nextIdx + 1 : litCount, shownTotal).map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r="1.8" />
          ))}
        </g>
      </svg>

      <div style={S.under}>
        <p style={S.count}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#D9B57A" style={{ marginRight: 7, verticalAlign: '-1px' }}>
            <path d="M12 3l2.2 5.3L20 9l-4.3 3.8L17 19l-5-3-5 3 1.3-6.2L4 9l5.8-.7z" />
          </svg>
          {complete ? 'The whole tree, in stars' : `${litCount} of ${shownTotal} stars lit`}
        </p>
        {!complete && (
          <p style={S.hint}>Finish an essay on the shelf, and a star lights here.</p>
        )}
        <div style={S.hairline} />
        {quote && (
          <>
            <p style={S.eyebrow}>Tonight&rsquo;s line</p>
            <p style={S.line}>&ldquo;{quote}&rdquo;</p>
            {attribution && <p style={S.by}>&mdash; {attribution}</p>}
          </>
        )}
      </div>
    </div>
  )
}

const S = {
  sky: {
    position: 'relative', borderRadius: 24, overflow: 'hidden',
    background: 'radial-gradient(120% 60% at 50% 102%, rgba(120,78,40,0.35) 0%, rgba(120,78,40,0) 60%), linear-gradient(180deg, #170D08 0%, #241710 45%, #3A2A1C 80%, #4A372A 100%)',
    boxShadow: '0 12px 32px -10px rgba(20,10,4,0.6), inset 0 0 60px rgba(0,0,0,0.35)',
  },
  art: { display: 'block', width: '100%', height: 'auto' },
  under: { padding: '14px 18px 17px', textAlign: 'center' },
  count: { fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#D9B57A', fontFamily: 'Georgia, serif', margin: '0 0 9px' },
  hint: { fontSize: 10.5, color: '#CBBA98', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0 0 9px', letterSpacing: '0.01em' },
  hairline: { width: 54, height: 1, background: 'linear-gradient(90deg, transparent, #C9A85C, transparent)', margin: '0 auto 9px' },
  eyebrow: { fontSize: 9.5, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(217,181,122,0.65)', fontFamily: 'Georgia, serif', margin: '0 0 7px' },
  line: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 15.5, color: '#FAF7F1', lineHeight: 1.58, margin: 0 },
  by: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11, color: '#CBBA98', margin: '8px 0 0' },
}