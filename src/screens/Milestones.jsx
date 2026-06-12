import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import VowBrandMark from '../components/VowBrandMark'
import MilestonePlate, { lineFor, MILESTONE_PLATE_CSS } from '../components/MilestonePlate'

// ===================================================================
// MILESTONES — "The Turning of the Light."
// ===================================================================
// One world, painted at every milestone in the catalog: pre-dawn at
// Day Zero, the sun climbing as the tree grows, golden hour, dusk,
// first stars, deep day-seeded night — and the crown on the final
// plate. Catalog (days_required + label) and earned state come from
// the database; the emoji badge_icon column is no longer rendered.
// Tap any plate to open it as a floater card.
// ===================================================================

const PAGE_CSS = `
@keyframes vowMsNextRing { 0%,100% { box-shadow: 0 3px 12px rgba(60,40,20,0.11) } 50% { box-shadow: 0 3px 18px rgba(201,168,92,0.5) } }
.vowMsNextBtn { animation: vowMsNextRing 2.4s ease-in-out infinite; }
@keyframes vowMsFloatIn { from { transform: translateY(26px) scale(0.95); opacity: 0 } to { transform: none; opacity: 1 } }
.vowMsFloater { animation: vowMsFloatIn 0.32s cubic-bezier(0.2, 0.9, 0.3, 1.2); }
@media (prefers-reduced-motion: reduce) { .vowMsNextBtn, .vowMsFloater { animation: none !important; } }`

export default function Milestones() {
  const { trackerId } = useParams()
  const navigate = useNavigate()

  const [tracker, setTracker] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [earned, setEarned] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const { data: t } = await supabase
          .from('trackers')
          .select('*, addiction_types(name, icon)')
          .eq('id', trackerId)
          .single()
        if (!t) { navigate('/app/home'); return }
        setTracker(t)

        const { data: m } = await supabase
          .from('milestones')
          .select('*')
          .order('days_required')
        setMilestones(m || [])

        const { data: e } = await supabase
          .from('user_milestones')
          .select('*')
          .eq('tracker_id', trackerId)
        setEarned(e || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [trackerId])

  if (loading || !tracker) {
    return (
      <div style={styles.frame}>
        <div style={{ ...styles.phone, textAlign: 'center', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', paddingTop: '4rem' }}>
          One moment…
        </div>
      </div>
    )
  }

  const start = new Date(tracker.start_date)
  const now = new Date()
  const currentDays = Math.floor((now - start) / (1000 * 60 * 60 * 24))
  const earnedIds = new Set(earned.map(e => e.milestone_id))
  const earnedAtById = {}
  earned.forEach(e => { earnedAtById[e.milestone_id] = e.created_at || e.earned_at || null })
  const earnedCount = milestones.filter(m => earnedIds.has(m.id)).length

  const nextMilestone = milestones.find(m => m.days_required > currentDays)
  const daysToNext = nextMilestone ? nextMilestone.days_required - currentDays : null
  const lastId = milestones.length ? milestones[milestones.length - 1].id : null

  const openPlate = (m) => {
    const isEarned = earnedIds.has(m.id) || m.days_required <= currentDays
    const isNext = nextMilestone?.id === m.id
    setOpen({ m, isEarned, isNext })
  }

  const niceDate = (iso) => {
    if (!iso) return null
    const d = new Date(iso)
    if (isNaN(d.getTime())) return null
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })
  }

  return (
    <div style={styles.frame}>
      <style>{MILESTONE_PLATE_CSS + PAGE_CSS}</style>
      <div style={styles.phone}>

        <div style={styles.topBar}>
          <button onClick={() => navigate('/app/home')} style={styles.backBtn}>&lsaquo; Back</button>
          <span style={styles.brandCenter}><VowBrandMark size={17} /></span>
          <div style={{ width: '60px' }} />
        </div>

        <div style={styles.head}>
          <h1 style={styles.title}>Milestones</h1>
          <p style={styles.sub}>One world. It grows, and the sky turns, as you hold on.</p>
        </div>

        <div style={styles.ledger}>
          <p style={styles.ledgerName}>{tracker.addiction_types?.name}</p>
          <p style={styles.ledgerDay}>Day {currentDays}</p>
          <p style={styles.ledgerLine}>
            <b style={styles.ledgerB}>{earnedCount} of {milestones.length} reached</b>
            {nextMilestone
              ? <> &middot; next: {nextMilestone.label}, {daysToNext === 1 ? '1 day' : `${daysToNext} days`} away</>
              : <> &middot; the year is crowned.</>}
          </p>
        </div>

        {milestones.length === 0 ? (
          <p style={styles.empty}>No milestones to show yet.</p>
        ) : (
          <div style={styles.grid}>
            {milestones.map(m => {
              const isEarned = earnedIds.has(m.id) || m.days_required <= currentDays
              const isNext = nextMilestone?.id === m.id
              const isFinal = m.id === lastId
              return (
                <button
                  key={m.id}
                  onClick={() => openPlate(m)}
                  className={isNext ? 'vowMsNextBtn' : undefined}
                  style={{
                    ...styles.plateBtn,
                    ...(isEarned ? styles.plateEarned : isNext ? styles.plateNext : styles.plateLocked),
                  }}
                >
                  <MilestonePlate day={m.days_required} label={m.label} isFinal={isFinal} anim={false} />
                  {isEarned || isNext ? (
                    <span style={styles.plateCap}>
                      <span style={styles.plateCapLabel}>{m.label}</span>
                    </span>
                  ) : (
                    <>
                      <span style={styles.lockedVeil} />
                      <span style={styles.lockedTag}>{m.label}</span>
                    </>
                  )}
                </button>
              )
            })}
          </div>
        )}

      </div>

      {open && (
        <div style={styles.overlay} onClick={() => setOpen(null)}>
          <div className="vowMsFloater" style={styles.floater} onClick={(e) => e.stopPropagation()}>
            <MilestonePlate day={open.m.days_required} label={open.m.label} isFinal={open.m.id === lastId} anim />
            <div style={styles.fBody}>
              <p style={styles.fDay}>{open.m.days_required === 0 ? 'The beginning' : `Day ${open.m.days_required}`}</p>
              <p style={styles.fName}>{open.m.label}</p>
              <p style={styles.fLine}>{lineFor(open.m.days_required, open.m.label)}</p>
              <p style={{ ...styles.fStatus, ...(open.isEarned ? styles.fStatusEarned : {}) }}>
                {open.isEarned
                  ? (niceDate(earnedAtById[open.m.id]) ? `Reached ${niceDate(earnedAtById[open.m.id])} \u2014 and held.` : 'Reached \u2014 and held.')
                  : open.isNext
                    ? `${open.m.days_required - currentDays} ${open.m.days_required - currentDays === 1 ? 'day' : 'days'} away. The light is already turning.`
                    : 'Still ahead. The sky will wait.'}
              </p>
              <button style={styles.fClose} onClick={() => setOpen(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  frame: { minHeight: '100vh', background: 'linear-gradient(180deg, #FDFBF6 0%, #F6EFDD 100%)', padding: '1.25rem 1rem 3rem', display: 'flex', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  phone: { maxWidth: '440px', width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' },

  topBar: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brandCenter: { position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', pointerEvents: 'none' },
  backBtn: { background: 'transparent', border: 'none', color: '#854F0B', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px', minWidth: '60px', textAlign: 'left' },

  head: { textAlign: 'center', padding: '4px 0 0' },
  title: { fontSize: '24px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: 0, lineHeight: 1.25 },
  sub: { fontSize: '12.5px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '7px 0 0' },

  ledger: { textAlign: 'center', padding: '0.9rem 0', borderTop: '0.5px solid #E8DFD0', borderBottom: '0.5px solid #E8DFD0' },
  ledgerName: { fontSize: '12px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0 0 6px' },
  ledgerDay: { fontSize: '30px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: 0, lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
  ledgerLine: { fontSize: '11.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '8px 0 0' },
  ledgerB: { color: '#854F0B', fontWeight: 500 },

  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '9px' },
  plateBtn: { position: 'relative', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 3px 12px rgba(60,40,20,0.11)', fontFamily: 'inherit' },
  plateEarned: { outline: '1.5px solid #C9A85C', outlineOffset: '-1.5px' },
  plateNext: { outline: '1.5px dashed #C9A85C', outlineOffset: '-1.5px' },
  plateLocked: { outline: '1px dashed #DCCBAA', outlineOffset: '-1px' },
  plateCap: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: '4px 2px 5px', textAlign: 'center', background: 'linear-gradient(0deg, rgba(20,11,5,0.78), rgba(20,11,5,0))', pointerEvents: 'none' },
  plateCapLabel: { display: 'block', fontFamily: 'Georgia, serif', fontSize: '10.5px', color: '#F6E8C4', fontWeight: 500, letterSpacing: '0.03em' },
  lockedVeil: { position: 'absolute', inset: 0, background: 'rgba(250,247,241,0.58)', pointerEvents: 'none' },
  lockedTag: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '10.5px', color: '#854F0B', background: 'rgba(253,251,246,0.92)', border: '0.5px solid #E5D9C2', borderRadius: '999px', padding: '3px 10px', pointerEvents: 'none', whiteSpace: 'nowrap' },
  empty: { fontSize: '13px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0', margin: 0 },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(28,17,10,0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '22px', zIndex: 1000 },
  floater: { width: '100%', maxWidth: '360px', background: '#FDFBF6', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 24px 70px rgba(20,11,4,0.5)' },
  fBody: { padding: '16px 20px 20px', textAlign: 'center' },
  fDay: { fontSize: '10px', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#854F0B', fontFamily: 'Georgia, serif', margin: '0 0 6px' },
  fName: { fontFamily: 'Georgia, serif', fontSize: '22px', color: '#2A1F15', fontWeight: 500, margin: '0 0 8px' },
  fLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '13.5px', color: '#6B5C4A', lineHeight: 1.6, margin: '0 0 12px' },
  fStatus: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '11.5px', color: '#9C8C78', margin: 0 },
  fStatusEarned: { color: '#854F0B' },
  fClose: { margin: '14px auto 0', display: 'block', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: '999px', padding: '10px 26px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' },
}