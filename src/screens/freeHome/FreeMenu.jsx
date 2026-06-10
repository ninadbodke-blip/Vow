import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SheetPortal from '../../components/SheetPortal'
import VowBrandMark from '../../components/VowBrandMark'
import { COLLECTIONS } from './collections/collections'

// ===================================================================
// FREE MENU  (hamburger slide-over)
// ===================================================================
// Practices: the six collections (unordered, no numbers, no locks). The
// one matching the user's stored state is quietly tagged "Suggested".
// Yours: the personal stuff. Milestones only shows if a tracker exists.
// ===================================================================

const svg = (children) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
)

const GLYPHS = {
  habit: svg(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="2.6" /></>),
  cost: svg(<><path d="M12 4v16M7 20h10M5 8h14" /><path d="M5 8l-2.5 5a3 3 0 0 0 5 0L5 8z" /><path d="M19 8l-2.5 5a3 3 0 0 0 5 0L19 8z" /></>),
  quit: svg(<path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z" />),
  day: svg(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" /></>),
  free: svg(<><path d="M12 21V11" /><path d="M12 11c0-3 2.4-5.5 5.5-5.5C17.5 8.6 15 11 12 11z" /><path d="M12 13.5c0-2.4-2-4.3-4.5-4.3C7.5 11.6 9.5 13.5 12 13.5z" /></>),
  slip: svg(<><path d="M3 18h18M12 6v2M5.6 9.6L7 11M18.4 9.6L17 11M8.2 18a4 4 0 0 1 7.6 0M2 14h2M20 14h2" /></>),
}

const AnchorGlyph = svg(<><circle cx="12" cy="5" r="2.2" /><path d="M12 7.2V21M5 13a7 7 0 0 0 14 0M3 13h2m14 0h2" /></>)
const ListGlyph = svg(<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />)
const AwardGlyph = svg(<><circle cx="12" cy="9" r="5" /><path d="M9 13.5L7.5 21l4.5-2.6L16.5 21 15 13.5" /></>)
const ProfileGlyph = svg(<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></>)

function MenuRow({ glyph, label, sub, tag, onClick }) {
  return (
    <button onClick={onClick} style={styles.row}>
      <span style={styles.glyph}>{glyph}</span>
      <span style={styles.rowText}>
        <span style={styles.rowLabelLine}>
          <span style={styles.rowLabel}>{label}</span>
          {tag && <span style={styles.tag}>{tag}</span>}
        </span>
        {sub && <span style={styles.rowSub}>{sub}</span>}
      </span>
    </button>
  )
}

export default function FreeMenu({ open, onClose, suggestedId, trackerId }) {
  const navigate = useNavigate()
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (!open) { setShown(false); return }
    const r = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(r)
  }, [open])

  if (!open) return null

  const go = (path) => { onClose(); navigate(path) }

  return (
    <SheetPortal>
      <div style={{ ...styles.backdrop, opacity: shown ? 1 : 0 }} onClick={onClose}>
        <aside
          style={{ ...styles.panel, transform: shown ? 'translateX(0)' : 'translateX(-100%)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={styles.head}>
            <VowBrandMark size={22} />
            <button onClick={onClose} style={styles.close} aria-label="Close menu">✕</button>
          </div>

          <p style={styles.sectionLabel}>Practices</p>
          <div style={styles.list}>
            {COLLECTIONS.map((c) => (
              <MenuRow
                key={c.id}
                glyph={GLYPHS[c.id]}
                label={c.label}
                sub={c.subtitle}
                tag={c.id === suggestedId ? 'Suggested' : null}
                onClick={() => go(`/app/practices/${c.id}`)}
              />
            ))}
          </div>

          <p style={styles.sectionLabel}>Yours</p>
          <div style={styles.list}>
            <MenuRow glyph={AnchorGlyph} label="Anchors" sub="The people you’re doing this for" onClick={() => go('/app/anchors')} />
            <MenuRow glyph={ListGlyph} label="Your log" sub="Moments you’ve noted" onClick={() => go('/app/urges')} />
            {trackerId && (
              <MenuRow glyph={AwardGlyph} label="Milestones" sub="Time you’ve given yourself" onClick={() => go(`/app/milestones/${trackerId}`)} />
            )}
            <MenuRow glyph={ProfileGlyph} label="Profile" sub="Settings and account" onClick={() => go('/app/profile')} />
          </div>
        </aside>
      </div>
    </SheetPortal>
  )
}

const styles = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(40,25,15,0.45)',
    backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
    zIndex: 300, transition: 'opacity 0.24s ease',
  },
  panel: {
    position: 'fixed', top: 0, left: 0, bottom: 0, width: '86%', maxWidth: '360px',
    background: '#FAF7F1', boxShadow: '8px 0 40px rgba(40,25,15,0.28)',
    padding: '1.5rem 1.25rem 2rem', overflowY: 'auto',
    transition: 'transform 0.24s ease',
    display: 'flex', flexDirection: 'column', gap: '6px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  head: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' },
  close: { width: '34px', height: '34px', borderRadius: '50%', border: '0.5px solid #E0D5C2', background: 'white', color: '#6B5C4A', fontSize: '14px', cursor: 'pointer', lineHeight: 1 },

  sectionLabel: { fontSize: '11px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '14px 0 8px', paddingLeft: '4px' },
  list: { display: 'flex', flexDirection: 'column' },

  row: { display: 'flex', alignItems: 'center', gap: '14px', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', borderRadius: '14px', padding: '12px 10px', cursor: 'pointer', fontFamily: 'inherit' },
  glyph: { width: '40px', height: '40px', flexShrink: 0, borderRadius: '12px', background: 'rgba(217,181,122,0.16)', color: '#854F0B', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  rowText: { display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 },
  rowLabelLine: { display: 'flex', alignItems: 'center', gap: '8px' },
  rowLabel: { fontSize: '16px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.2 },
  rowSub: { fontSize: '12.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.35 },
  tag: { fontSize: '9.5px', color: '#6B4A12', background: 'rgba(217,181,122,0.34)', borderRadius: '20px', padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', whiteSpace: 'nowrap' },
}