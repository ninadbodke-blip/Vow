import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { createStageMove } from './stageMove'

// Shared wayfinding header for every free-stage home: a quiet dot-tally
// breadcrumb that opens the 6-stage map. The map respects the SAME Build
// gate as the Profile stage navigator — Build stays locked until the user
// has held 30 days on the tracker (or has already reached Build / Reclaim).

const ChevronDown = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
)

const STAGE_MAP = [
  { key: 'notice', label: 'Notice', blurb: 'See the pattern, without pressure.' },
  { key: 'reflect', label: 'Reflect', blurb: 'Weigh what it really costs you.' },
  { key: 'commit', label: 'Commit', blurb: 'Draw the line, on your terms.' },
  { key: 'endure', label: 'Endure', blurb: 'Hold the line, one day at a time.' },
  { key: 'build', label: 'Build', blurb: 'Rebuild the life around it.' },
  { key: 'reclaim', label: 'Reclaim', blurb: 'Find your feet again after a slip.' },
]

export default function StageWayfinder({ progress }) {
  const [mapOpen, setMapOpen] = useState(false)
  const [tracker, setTracker] = useState(null)
  const [moving, setMoving] = useState(false)
  const [sheet, setSheet] = useState(null)
  const [stopDateISO, setStopDateISO] = useState(null)
  const [primarySubstance, setPrimarySubstance] = useState(null)
  const [hasBegunEndure, setHasBegunEndure] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: vpp } = await supabase
        .from('vow_path_progress')
        .select('free_state, endure_starts_at, primary_substance')
        .eq('user_id', user.id)
        .maybeSingle()
      const { data: trk } = await supabase
        .from('trackers')
        .select('id, start_date')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at')
        .limit(1)
      // Same "has Endure genuinely begun" detection as Profile, so resuming a
      // live streak never restarts the day-one clock or relocks Build.
      let begun = vpp?.free_state === 'endure' || vpp?.free_state === 'build'
      if (!begun) {
        const { data: ev } = await supabase
          .from('free_stage_signals')
          .select('id')
          .eq('user_id', user.id)
          .or('signal_type.eq.endure_began,stage.eq.endure,stage.eq.build')
          .limit(1)
        begun = !!(ev && ev.length)
      }
      if (cancelled) return
      if (trk && trk[0]) setTracker(trk[0])
      setStopDateISO(vpp?.endure_starts_at || null)
      setPrimarySubstance(vpp?.primary_substance || null)
      setHasBegunEndure(begun)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const stage = progress?.free_state
  const stageIdx = Math.max(0, STAGE_MAP.findIndex(s => s.key === stage))
  // Identical rule to Profile's stage navigator.
  const daysOnTracker = tracker?.start_date
    ? Math.floor((Date.now() - new Date(tracker.start_date).getTime()) / 86400000)
    : 0
  const buildUnlocked = stage === 'build' || stage === 'reclaim' || daysOnTracker >= 30

  // Same logic Profile uses — moving to a stage here carries the identical
  // streak / Endure-clock / slip guards. We hard-navigate home afterward so
  // HomeRouter re-reads the new free_state (a same-route push wouldn't repaint).
  const goToStage = createStageMove({
    stage, tracker, hasBegunEndure, stopDateISO, primarySubstance,
    daysOnTracker, buildUnlocked, moving, setMoving, setSheet,
    navigate: () => window.location.assign('/home'),
    onClose: () => setMapOpen(false),
  })

  return (
    <>
      <button onClick={() => setMapOpen(true)} style={styles.breadcrumb} aria-label="Where you are">
        <span style={styles.breadcrumbDots}>
          {STAGE_MAP.map((st, i) => (
            <span key={st.key} style={{ ...styles.breadcrumbDot, color: i === stageIdx ? '#D9B57A' : '#CDBFA8' }}>
              {i === stageIdx ? '•' : '·'}
            </span>
          ))}
        </span>
        <span style={styles.breadcrumbName}>
          Where you are
          <ChevronDown />
        </span>
      </button>

      {mapOpen && (
        <div style={styles.sheetBackdrop} onClick={() => setMapOpen(false)}>
          <div style={styles.sheetCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.sheetHead}>
              <div>
                <p style={styles.sheetEyebrow}>Where you are</p>
                <h3 style={styles.sheetTitle}>The 6-stage journey</h3>
              </div>
              <button onClick={() => setMapOpen(false)} style={styles.sheetClose}>✕</button>
            </div>
            <div style={styles.mapThreadWrap}>
              <div style={styles.mapThread} />
              {STAGE_MAP.map((st, i) => {
                const isCurrent = st.key === stage
                const isLocked = st.key === 'build' && !buildUnlocked
                const disabled = isCurrent || isLocked
                return (
                  <button
                    key={st.key}
                    onClick={() => { if (!disabled) { setMapOpen(false); goToStage(st.key) } }}
                    disabled={disabled}
                    style={{ ...styles.mapRow, ...(isCurrent ? styles.mapRowCurrent : {}), ...(isLocked ? styles.mapRowLocked : {}), cursor: disabled ? 'default' : 'pointer' }}
                  >
                    <span style={{ ...styles.mapNode, ...(isCurrent ? styles.mapNodeCurrent : {}), background: isCurrent ? 'transparent' : '#FCFAF5' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={styles.mapBody}>
                      {isCurrent && <span style={styles.mapEyebrowCurrent}>You're here</span>}
                      <span style={{ ...styles.mapLabel, ...(isCurrent ? styles.mapLabelCurrent : {}) }}>{st.label}</span>
                      {isLocked
                        ? <span style={styles.mapLockTag}>Unlocks after 30 days in Endure</span>
                        : <span style={{ ...styles.mapBlurb, ...(isCurrent ? styles.mapBlurbCurrent : {}) }}>{st.blurb}</span>}
                    </span>
                  </button>
                )
              })}
            </div>
            <p style={styles.mapFootnote}>Move to any stage whenever it fits where you actually are.</p>
          </div>
        </div>
      )}

      {sheet && (
        <div style={styles.confirmOverlay} onClick={() => { if (!moving) setSheet(null) }}>
          <div style={styles.confirmCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.confirmTitle}>{sheet.title}</h3>
            <p style={styles.confirmBody}>{sheet.body}</p>
            <div style={styles.confirmActions}>
              {sheet.actions.map((a, i) => (
                <button
                  key={i}
                  onClick={a.run}
                  disabled={moving}
                  style={{ ...styles.confirmBtn, ...(a.primary ? styles.confirmBtnPrimary : a.danger ? styles.confirmBtnDanger : styles.confirmBtnGhost) }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const styles = {
  breadcrumb: { background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '4px 10px' },
  breadcrumbDots: { display: 'flex', alignItems: 'center', gap: '5px', lineHeight: 1 },
  breadcrumbDot: { fontSize: '11px', lineHeight: 1 },
  breadcrumbName: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic' },

  sheetBackdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(40,25,15,0.55)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', zIndex: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px' },
  sheetCard: { width: '100%', maxWidth: '430px', maxHeight: '88vh', overflowY: 'auto', background: '#FCFAF5', borderRadius: '22px', padding: '20px 20px 22px', boxShadow: '0 24px 70px rgba(40,25,15,0.4)' },
  sheetHead: { display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' },
  sheetEyebrow: { fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A07A3C', fontFamily: 'Georgia, serif', margin: '0 0 4px' },
  sheetTitle: { fontSize: '19px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif', margin: 0, lineHeight: 1.25 },
  sheetClose: { flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', border: '0.5px solid #E0D5C2', background: 'white', color: '#6B5C4A', fontSize: '13px', cursor: 'pointer', lineHeight: 1 },

  mapThreadWrap: { position: 'relative', paddingLeft: '2px', margin: '4px 0 8px' },
  mapThread: { position: 'absolute', left: '17px', top: '14px', bottom: '14px', width: '1.5px', background: '#D9B57A', opacity: 0.4, zIndex: 0 },
  mapRow: { position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: '14px', width: '100%', background: 'transparent', border: 'none', textAlign: 'left', padding: '11px 4px', fontFamily: 'inherit' },
  mapRowCurrent: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', borderRadius: '16px', padding: '16px', margin: '6px 0', boxShadow: '0 10px 24px -10px rgba(40,25,10,0.45)' },
  mapRowLocked: { opacity: 0.4 },
  mapNode: { width: '30px', flexShrink: 0, textAlign: 'center', fontSize: '12px', fontWeight: 500, color: '#854F0B', fontFamily: 'Georgia, serif', fontVariantNumeric: 'tabular-nums', lineHeight: '1.6', paddingTop: '1px' },
  mapNodeCurrent: { color: '#D9B57A' },
  mapBody: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '1px' },
  mapEyebrowCurrent: { fontSize: '10px', color: '#D9B57A', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  mapLabel: { fontSize: '16px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500 },
  mapLabelCurrent: { color: '#FAF7F1' },
  mapBlurb: { fontSize: '12.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.4 },
  mapBlurbCurrent: { color: '#CBBA98' },
  mapLockTag: { fontSize: '12px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.4 },
  mapFootnote: { fontSize: '12px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', margin: '12px 0 2px', lineHeight: 1.45 },

  confirmOverlay: { position: 'fixed', inset: 0, background: 'rgba(36,23,16,0.5)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 320 },
  confirmCard: { width: '100%', maxWidth: '440px', background: '#FAF7F1', borderRadius: '24px 24px 0 0', padding: '24px 22px 28px', boxShadow: '0 -8px 40px rgba(40,25,10,0.3)' },
  confirmTitle: { fontSize: '20px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 10px' },
  confirmBody: { fontSize: '14.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 20px' },
  confirmActions: { display: 'flex', flexDirection: 'column', gap: '10px' },
  confirmBtn: { width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', border: 'none' },
  confirmBtnPrimary: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', boxShadow: '0 4px 14px rgba(40,25,10,0.22)' },
  confirmBtnDanger: { background: '#FBF1EC', color: '#B23B1E', border: '0.5px solid #E6C3B4' },
  confirmBtnGhost: { background: 'white', color: '#6B5C4A', border: '0.5px solid #DDCFB6' },
}