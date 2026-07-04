// =====================================================================
// OVERVIEW KIT — shared drawn pieces for the stage overview timelines.
// =====================================================================
// Small SVG vignettes in the day-world palette, keyed by KIND, so every
// stage overview (Notice / Reflect / Commit / Endure / …) shares one
// vocabulary of hand-drawn medallions instead of duplicating art.
// Pure decoration: no data, no handlers, no side effects.
// =====================================================================

const MP = { ring: '#D9B57A', ringSoft: '#E4D4B4', bg: '#F6EFE2', bark: '#82603F', barkD: '#5F4429', leaf: '#74875A', leafL: '#93A36B', gold: '#C9A85C', goldD: '#854F0B', cream: '#FDFBF6', ink: '#3A2A1C', mut: '#B8A88E' }

export function MedallionArt({ kind }) {
  switch (kind) {
    case 'tree': return (<g><path d="M24 34 L24 22" stroke={MP.bark} strokeWidth="2" fill="none"/><path d="M24 26 C18 24 14 18 15 13 C21 13 25 17 24 24 M24 24 C27 18 32 15 36 16 C35 21 30 25 24 26" fill={MP.leafL}/><circle cx="24" cy="15" r="4.5" fill={MP.leaf}/></g>)
    case 'journal': return (<g><rect x="15" y="12" width="18" height="24" rx="2.5" fill={MP.cream} stroke={MP.gold} strokeWidth="1.4"/><path d="M19 18 H29 M19 23 H29 M19 28 H25" stroke={MP.mut} strokeWidth="1.4" strokeLinecap="round"/><path d="M15 14 C13 16 13 32 15 34" stroke={MP.bark} strokeWidth="1.6" fill="none"/></g>)
    case 'eye': return (<g><path d="M10 24 C15 16 33 16 38 24 C33 32 15 32 10 24 Z" fill={MP.cream} stroke={MP.bark} strokeWidth="1.5"/><circle cx="24" cy="24" r="5.5" fill={MP.leaf}/><circle cx="24" cy="24" r="2.2" fill={MP.ink}/></g>)
    case 'piles': return (<g><path d="M12 33 L19 20 L25 33 Z" fill={MP.leafL}/><path d="M20 33 L28 15 L36 33 Z" fill={MP.leaf}/><circle cx="31" cy="19" r="1.6" fill={MP.cream}/></g>)
    case 'coins': return (<g><ellipse cx="18" cy="31" rx="6" ry="2.6" fill={MP.gold}/><ellipse cx="18" cy="28" rx="6" ry="2.6" fill={MP.goldD}/><path d="M30 34 L30 24" stroke={MP.bark} strokeWidth="1.8"/><path d="M30 27 C27 25 25 22 26 19 C29 20 31 22 30 27 M30 25 C32 22 35 21 37 22 C36 25 33 26 30 25" fill={MP.leafL}/></g>)
    case 'letter': return (<g><rect x="12" y="16" width="24" height="16" rx="2" fill={MP.cream} stroke={MP.gold} strokeWidth="1.4"/><path d="M12 17 L24 26 L36 17" stroke={MP.gold} strokeWidth="1.4" fill="none"/><circle cx="33" cy="15" r="3" fill={MP.goldD}/></g>)
    case 'candle': return (<g><rect x="21" y="20" width="6" height="13" rx="1.5" fill={MP.cream} stroke={MP.gold} strokeWidth="1"/><ellipse cx="24" cy="34" rx="8" ry="2" fill={MP.goldD} opacity="0.35"/><path d="M24 12 C26.5 15.5 26 18 24 19 C22 18 21.5 15.5 24 12 Z" fill={MP.gold}/><circle cx="24" cy="16" r="4.5" fill={MP.gold} opacity="0.22"/></g>)
    case 'scales': return (<g><path d="M24 13 L24 33 M14 17 L34 17" stroke={MP.bark} strokeWidth="1.8"/><path d="M10 24 C10 27 18 27 18 24 L14 17 Z" fill={MP.leafL}/><path d="M30 27 C30 30 38 30 38 27 L34 17 Z" fill={MP.leaf}/><rect x="19" y="32" width="10" height="2.4" rx="1.2" fill={MP.bark}/></g>)
    case 'body': return (<g><circle cx="24" cy="15" r="4" fill={MP.bark}/><path d="M24 20 C18 22 17 27 18 34 L30 34 C31 27 30 22 24 20 Z" fill={MP.leafL}/><circle cx="24" cy="26" r="2.2" fill={MP.goldD}/></g>)
    case 'waymark': return (<g><path d="M17 34 C16 25 19 16 24 12 C29 16 32 25 31 34 Z" fill={MP.mut}/><path d="M24 12 C29 16 32 25 31 34 L24 34 Z" fill={MP.bark} opacity="0.35"/><path d="M20 24 H28" stroke={MP.cream} strokeWidth="1.8" strokeLinecap="round"/></g>)
    case 'fork': return (<g><path d="M24 35 L24 26 C24 21 19 19 15 15" stroke={MP.bark} strokeWidth="2.2" fill="none"/><path d="M24 26 C24 21 29 19 33 15" stroke={MP.gold} strokeWidth="2.2" fill="none"/><circle cx="33" cy="14" r="2.6" fill={MP.gold}/><circle cx="15" cy="14" r="2.2" fill={MP.mut}/></g>)
    case 'speech': return (<g><path d="M13 16 h22 a2 2 0 0 1 2 2 v9 a2 2 0 0 1 -2 2 H22 l-6 5 v-5 h-3 a2 2 0 0 1 -2 -2 v-9 a2 2 0 0 1 2 -2 Z" fill={MP.cream} stroke={MP.bark} strokeWidth="1.5"/><path d="M18 21 H30 M18 25 H26" stroke={MP.mut} strokeWidth="1.5" strokeLinecap="round"/></g>)
    case 'lantern': return (<g><rect x="19" y="15" width="10" height="15" rx="2" fill={MP.cream} stroke={MP.bark} strokeWidth="1.5"/><path d="M19 15 L24 11 L29 15" stroke={MP.bark} strokeWidth="1.5" fill="none"/><path d="M24 30 L24 34" stroke={MP.bark} strokeWidth="1.5"/><circle cx="24" cy="22" r="3" fill={MP.gold}/><circle cx="24" cy="22" r="5.5" fill={MP.gold} opacity="0.2"/></g>)
    case 'sorter': return (<g><circle cx="16" cy="19" r="4" fill={MP.leafL}/><circle cx="28" cy="15" r="3.2" fill={MP.leaf}/><circle cx="34" cy="23" r="2.8" fill={MP.mut}/><path d="M14 30 H34 M17 34 H31" stroke={MP.bark} strokeWidth="1.8" strokeLinecap="round"/></g>)
    case 'columns': return (<g><rect x="13" y="14" width="9" height="20" rx="2" fill={MP.cream} stroke={MP.mut} strokeWidth="1.4"/><rect x="26" y="14" width="9" height="20" rx="2" fill={MP.cream} stroke={MP.gold} strokeWidth="1.4"/><path d="M16 20 h3 M16 25 h3 M29 20 h3 M29 25 h3 M29 30 h3" stroke={MP.bark} strokeWidth="1.3" strokeLinecap="round"/></g>)
    case 'ruler': return (<g><path d="M12 29 H36" stroke={MP.bark} strokeWidth="2"/><path d="M15 29 v-5 M20 29 v-8 M25 29 v-5 M30 29 v-8 M35 29 v-5" stroke={MP.bark} strokeWidth="1.5"/><circle cx="30" cy="17" r="2.8" fill={MP.gold}/></g>)
    case 'portrait': return (<g><rect x="14" y="12" width="20" height="24" rx="2" fill={MP.cream} stroke={MP.gold} strokeWidth="1.6"/><circle cx="24" cy="21" r="4" fill={MP.mut}/><path d="M17 33 C19 27 29 27 31 33" fill={MP.leafL}/></g>)
    case 'doors': return (<g>{[13, 21, 29].map((x, i) => (<path key={x} d={`M${x} 33 v-13 a3 3 0 0 1 6 0 v13 Z`} fill={i === 1 ? MP.gold : MP.cream} stroke={i === 1 ? MP.goldD : MP.mut} strokeWidth="1.3"/>))}</g>)
    // — kinds added for Notice / Commit / Endure —
    case 'boundary': return (<g><path d="M13 32 H35" stroke={MP.bark} strokeWidth="2" strokeLinecap="round"/><path d="M17 32 v-12 M31 32 v-12" stroke={MP.bark} strokeWidth="1.8"/><path d="M14 23 L34 17" stroke={MP.goldD} strokeWidth="1.8" strokeLinecap="round" strokeDasharray="3 3"/><circle cx="34" cy="17" r="2.2" fill={MP.gold}/></g>)
    case 'drift': return (<g><path d="M11 20 C16 17 20 23 25 20 C30 17 34 23 38 20" stroke={MP.mut} strokeWidth="1.8" fill="none" strokeLinecap="round"/><path d="M10 27 C15 24 19 30 24 27 C29 24 33 30 37 27" stroke={MP.leaf} strokeWidth="1.8" fill="none" strokeLinecap="round"/><path d="M20 12 L28 9 L27 14 Z" fill={MP.bark}/></g>)
    case 'people': return (<g><circle cx="18" cy="17" r="3.6" fill={MP.bark}/><path d="M18 21 C13 23 12 27 13 33 L23 33 C24 27 23 23 18 21 Z" fill={MP.leafL}/><circle cx="30" cy="19" r="3.2" fill={MP.barkD}/><path d="M30 23 C26 24.6 25 28 25.8 33 L34.4 33 C35 28 34 24.6 30 23 Z" fill={MP.leaf}/></g>)
    case 'calendar': return (<g><rect x="13" y="15" width="22" height="19" rx="2.5" fill={MP.cream} stroke={MP.bark} strokeWidth="1.5"/><path d="M13 21 H35" stroke={MP.bark} strokeWidth="1.3"/><path d="M18 12 v5 M30 12 v5" stroke={MP.bark} strokeWidth="1.6" strokeLinecap="round"/><circle cx="28" cy="28" r="3.2" fill={MP.gold}/></g>)
    case 'home': return (<g><path d="M12 23 L24 12 L36 23" stroke={MP.bark} strokeWidth="1.8" fill="none" strokeLinecap="round"/><path d="M16 22 v12 h16 v-12" fill={MP.cream} stroke={MP.bark} strokeWidth="1.5"/><rect x="21.5" y="27" width="5" height="7" fill={MP.gold}/></g>)
    case 'anchor': return (<g><circle cx="24" cy="13" r="3" fill="none" stroke={MP.bark} strokeWidth="1.8"/><path d="M24 16 V32" stroke={MP.bark} strokeWidth="1.8"/><path d="M19 20 H29" stroke={MP.bark} strokeWidth="1.8" strokeLinecap="round"/><path d="M14 26 C14 31 19 34 24 34 C29 34 34 31 34 26" stroke={MP.goldD} strokeWidth="1.8" fill="none" strokeLinecap="round"/></g>)
    case 'seal': return (<g><circle cx="24" cy="24" r="9" fill={MP.goldD}/><circle cx="24" cy="24" r="6.4" fill="none" stroke={MP.gold} strokeWidth="1.2"/><path d="M21 24 L23.4 26.5 L27.5 21.5" stroke={MP.cream} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 33 L18 29 M33 33 L30 29" stroke={MP.gold} strokeWidth="1.6" strokeLinecap="round"/></g>)
    case 'sunrise': return (<g><path d="M11 30 H37" stroke={MP.bark} strokeWidth="1.8" strokeLinecap="round"/><path d="M17 30 a7 7 0 0 1 14 0 Z" fill={MP.gold}/><path d="M24 16 v-4 M15 19 l-2.5 -2.5 M33 19 l2.5 -2.5" stroke={MP.goldD} strokeWidth="1.6" strokeLinecap="round"/></g>)
    case 'roots': return (<g><path d="M24 12 L24 22" stroke={MP.bark} strokeWidth="2.2"/><circle cx="24" cy="12" r="4" fill={MP.leaf}/><path d="M24 22 C20 25 16 26 13 31 M24 22 C24 27 24 30 24 34 M24 22 C28 25 32 26 35 31" stroke={MP.barkD} strokeWidth="1.7" fill="none" strokeLinecap="round"/></g>)
    default: return (<g><path d="M24 34 L24 20" stroke={MP.bark} strokeWidth="2"/><path d="M24 24 C20 22 18 18 19 15 C23 16 25 19 24 24 M24 22 C26 19 30 17 32 18 C31 21 27 23 24 22" fill={MP.leafL}/></g>)
  }
}

// Medallion = drawn vignette in a ringed circle, with a status badge:
// gold check when done, small padlock when locked.
export function Medallion({ art, done, locked }) {
  return (
    <span style={{ position: 'relative', width: 40, height: 40, flex: '0 0 40px', display: 'inline-block' }}>
      <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
        <circle cx="24" cy="24" r="22" fill={MP.bg} stroke={done ? MP.ring : MP.ringSoft} strokeWidth="1.6" />
        <g opacity={locked ? 0.45 : 1}><MedallionArt kind={art} /></g>
      </svg>
      {done && (
        <svg viewBox="0 0 16 16" width="15" height="15" style={{ position: 'absolute', right: -2, bottom: -1 }} aria-hidden="true">
          <circle cx="8" cy="8" r="7.5" fill={MP.goldD} />
          <path d="M4.6 8.2 L7 10.6 L11.4 5.8" stroke="#FAF7F1" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {locked && (
        <svg viewBox="0 0 16 16" width="14" height="14" style={{ position: 'absolute', right: -1, bottom: 0 }} aria-hidden="true">
          <circle cx="8" cy="8" r="7.5" fill="#EDE4D2" stroke="#D8CCB8" strokeWidth="0.8" />
          <rect x="5" y="7.2" width="6" height="4.6" rx="1" fill={MP.mut} />
          <path d="M6.2 7.2 v-1.4 a1.8 1.8 0 0 1 3.6 0 v1.4" stroke={MP.mut} strokeWidth="1.3" fill="none" />
        </svg>
      )}
    </span>
  )
}

// Week/phase badge on the section header.
export function WeekBadge({ art }) {
  return (
    <svg viewBox="0 0 48 48" width="36" height="36" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="none" stroke={MP.ring} strokeWidth="1.4" />
      <MedallionArt kind={art} />
    </svg>
  )
}

// The candle on the Today's-work vault card.
export function CandleArt() {
  return (
    <svg viewBox="0 0 44 56" width="40" height="51" aria-hidden="true" style={{ flex: '0 0 40px' }}>
      <circle cx="22" cy="18" r="14" fill="#F6E8C4" opacity="0.13" />
      <circle cx="22" cy="18" r="8" fill="#F6E8C4" opacity="0.16" />
      <rect x="17" y="24" width="10" height="22" rx="2" fill="#EFE2C8" />
      <rect x="17" y="24" width="10" height="4" rx="2" fill="#E4D2AC" />
      <path d="M22 22 v-3" stroke="#5F4429" strokeWidth="1.2" />
      <path d="M22 8 C25.4 12.6 24.8 16 22 17.6 C19.2 16 18.6 12.6 22 8 Z" fill="#EFDCAF" />
      <path d="M22 11 C23.6 13.4 23.3 15.2 22 16.1 C20.7 15.2 20.4 13.4 22 11 Z" fill="#D9B57A" />
      <ellipse cx="22" cy="49" rx="13" ry="2.6" fill="#120B06" opacity="0.5" />
    </svg>
  )
}