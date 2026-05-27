import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../LanguageContext'
import { supabase } from '../supabaseClient'
import BottomNav from '../components/BottomNav'
import VowBrandMark from '../components/VowBrandMark'
import { createStageMove } from './freeHome/stageMove'

const STAGE_LABELS = {
  notice: 'Notice',
  reflect: 'Reflect',
  commit: 'Commit',
  endure: 'Endure',
  build: 'Build',
  reclaim: 'Reclaim',
}

// Profile stage navigator — like the picker, but it CAN show Reclaim and it
// respects the 30-day Build gate. Order is the journey order.
const STAGE_META = [
  { key: 'notice',  label: 'Notice',  icon: '👁', desc: 'Just watching the pattern. No pressure to change yet.' },
  { key: 'reflect', label: 'Reflect', icon: '🔍', desc: 'Looking honestly at what it is costing you.' },
  { key: 'commit',  label: 'Commit',  icon: '🤝', desc: 'Getting ready. Building toward a stop date.' },
  { key: 'endure',  label: 'Endure',  icon: '🛡', desc: 'The early stretch. Holding the line, day by day.' },
  { key: 'build',   label: 'Build',   icon: '🌱', desc: 'Past the acute phase. Building the life around it.' },
  { key: 'reclaim', label: 'Reclaim', icon: '🌊', desc: 'Back after a slip. Nothing you built is lost.' },
]

export default function Profile() {
  const { lang, setLang } = useLang()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [stage, setStage] = useState(null)
  const [loading, setLoading] = useState(true)

  const [editingName, setEditingName] = useState(false)
  const [editingWhy, setEditingWhy] = useState(false)
  const [showFullWhy, setShowFullWhy] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [whyDraft, setWhyDraft] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showStages, setShowStages] = useState(false)
  const [tracker, setTracker] = useState(null)
  const [moving, setMoving] = useState(false)
  const [sheet, setSheet] = useState(null)
  const [stopDateISO, setStopDateISO] = useState(null)
  const [primarySubstance, setPrimarySubstance] = useState(null)
  const [hasBegunEndure, setHasBegunEndure] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data: { user: u } } = await supabase.auth.getUser()
        if (!u) { navigate('/signup'); return }
        setUser(u)

        const { data: p } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', u.id)
          .maybeSingle()
        setProfile(p)
        setNameDraft(p?.full_name || '')
        setWhyDraft(p?.bio || '')

        const { data: vpp } = await supabase
          .from('vow_path_progress')
          .select('free_state, endure_starts_at, primary_substance')
          .eq('user_id', u.id)
          .maybeSingle()
        if (vpp?.free_state) setStage(vpp.free_state)
        if (vpp) {
          setStopDateISO(vpp.endure_starts_at || null)
          setPrimarySubstance(vpp.primary_substance || null)
        }

        const { data: trk } = await supabase
          .from('trackers')
          .select('id, start_date')
          .eq('user_id', u.id)
          .eq('is_active', true)
          .order('created_at')
          .limit(1)
        if (trk && trk[0]) setTracker(trk[0])

        // Has Endure already begun at least once? If so, returning to Endure
        // after looking around an earlier stage must RESUME the live streak —
        // never restart the clock or relock Build. Onboarding activates the
        // tracker, so is_active alone can't tell us this; we look for real
        // Endure history (current stage, the begin-marker, or any endure/build signal).
        let begun = vpp?.free_state === 'endure' || vpp?.free_state === 'build'
        if (!begun) {
          const { data: ev } = await supabase
            .from('free_stage_signals')
            .select('id')
            .eq('user_id', u.id)
            .or('signal_type.eq.endure_began,stage.eq.endure,stage.eq.build')
            .limit(1)
          begun = !!(ev && ev.length)
        }
        setHasBegunEndure(begun)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const saveName = async () => {
    await supabase.from('profiles').update({ full_name: nameDraft }).eq('id', user.id)
    setProfile({ ...profile, full_name: nameDraft })
    setEditingName(false)
  }

  const saveWhy = async () => {
    await supabase.from('profiles').update({ bio: whyDraft }).eq('id', user.id)
    setProfile({ ...profile, bio: whyDraft })
    setEditingWhy(false)
  }

  const daysOnTracker = tracker?.start_date
    ? Math.floor((Date.now() - new Date(tracker.start_date).getTime()) / 86400000)
    : 0
  const buildUnlocked = stage === 'build' || stage === 'reclaim' || daysOnTracker >= 30

  // Stage-move logic lives in one shared place (freeHome/stageMove) so this
  // screen and the home wayfinder drive the streak / Endure-clock / slip
  // side-effects through identical code. The sheet + moving state stay local.
  const goToStage = createStageMove({
    stage, tracker, hasBegunEndure, stopDateISO, primarySubstance,
    daysOnTracker, buildUnlocked, moving, setMoving, setSheet, navigate,
    onClose: () => setShowStages(false),
  })

  const resetLang = () => {
    localStorage.removeItem('vow_lang')
    setLang(null)
    navigate('/')
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/welcome')
  }

  if (loading) {
    return (
      <div style={styles.frame}>
        <div style={{ ...styles.phone, textAlign: 'center', color: '#9C8C78' }}>
          Loading...
        </div>
      </div>
    )
  }

  const fullBio = profile?.bio || ''
  const previewLength = Math.min(fullBio.length, 140)
  const bioPreview = fullBio.slice(0, previewLength).trim()
  const hasMore = fullBio.length > previewLength

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        {/* TOP BAR */}
        <div style={styles.topBar}>
          <VowBrandMark />
          <button
            onClick={() => setShowSettings(true)}
            style={styles.settingsLink}
            aria-label="Settings"
          >
            Settings
          </button>
        </div>

        {/* THE FRONTISPIECE */}
        <div style={styles.frontispiece}>
          <div style={styles.monogram}>
            {(profile?.full_name || 'V').charAt(0).toUpperCase()}
          </div>
          {editingName ? (
            <div style={styles.nameEditWrap}>
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                style={styles.nameInput}
                autoFocus
              />
              <div style={styles.nameEditActions}>
                <button onClick={saveName} style={styles.nameSave}>Save</button>
                <button
                  onClick={() => { setEditingName(false); setNameDraft(profile?.full_name || '') }}
                  style={styles.nameCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <button onClick={() => setEditingName(true)} style={styles.nameBtn} aria-label="Edit name">
                <span style={styles.frontName}>{profile?.full_name || 'Your name'}</span>
              </button>
              <p style={styles.frontEmail}>{user?.email}</p>
              {stage && (
                <p style={styles.frontStage}>{STAGE_LABELS[stage]} path</p>
              )}
            </>
          )}
        </div>

        {/* THE EPIGRAPH — the vow */}
        <div style={styles.epigraphSection}>
          <p style={styles.sectionLabel}>Why I started</p>

          {editingWhy ? (
            <div style={styles.whyEditWrap}>
              <textarea
                value={whyDraft}
                onChange={(e) => setWhyDraft(e.target.value)}
                placeholder="On weak days, this is what brought you here..."
                style={styles.whyTextarea}
                autoFocus
                maxLength={3000}
              />
              <div style={styles.whyEditActions}>
                <button
                  onClick={() => { setEditingWhy(false); setWhyDraft(profile?.bio || '') }}
                  style={styles.epLinkMuted}
                >
                  Cancel
                </button>
                <button onClick={saveWhy} style={styles.epLink}>Save</button>
              </div>
            </div>
          ) : fullBio ? (
            <div style={styles.epigraph}>
              <p style={styles.epigraphText}>
                <span style={styles.epigraphDropCap}>{(showFullWhy ? fullBio : bioPreview).charAt(0)}</span>
                {(showFullWhy ? fullBio : (bioPreview + (hasMore ? '…' : ''))).slice(1)}
              </p>
              <div style={styles.epigraphFooter}>
                {hasMore && (
                  <button onClick={() => setShowFullWhy(!showFullWhy)} style={styles.epLink}>
                    {showFullWhy ? 'Show less' : 'Read more'}
                  </button>
                )}
                <button onClick={() => setEditingWhy(true)} style={styles.epLinkMuted}>
                  Edit
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setEditingWhy(true)} style={styles.epEmptyBtn}>
              <span style={styles.epEmptyPlus}>+</span>
              <span style={styles.epEmptyText}>Inscribe your vow…</span>
            </button>
          )}
        </div>

        {/* THE LEDGER */}
        {stage && (
          <div style={styles.ledger}>
            <div style={styles.ledgerCol}>
              <p style={styles.ledgerNum}>{daysOnTracker}</p>
              <p style={styles.ledgerLabel}>Days on the path</p>
            </div>
            <div style={styles.ledgerDivider} />
            <div style={styles.ledgerCol}>
              <p style={styles.ledgerWord}>{STAGE_LABELS[stage]}</p>
              <p style={styles.ledgerLabel}>Current stage</p>
            </div>
          </div>
        )}

        {/* YOUR PATH */}
        <div style={styles.section}>
          <p style={styles.sectionLabel}>Your path</p>
          <button onClick={() => setShowStages(s => !s)} style={styles.moveRow}>
            <span style={styles.moveRowText}>
              <span style={styles.moveRowLabel}>Move to a different stage</span>
              <span style={styles.moveRowHelper}>
                Recovery isn't a straight line. Jump to where you actually are.
              </span>
            </span>
            <span style={styles.moveArrow}>{showStages ? '⌄' : '›'}</span>
          </button>

          {showStages && (
            <div style={styles.threadWrap}>
              <div style={styles.thread} />
              {STAGE_META.map((st, i) => {
                const isCurrent = st.key === stage
                const locked = st.key === 'build' && !buildUnlocked
                return (
                  <button
                    key={st.key}
                    onClick={() => goToStage(st.key)}
                    disabled={moving || isCurrent}
                    style={{
                      ...styles.threadRow,
                      ...(isCurrent ? styles.threadRowCurrent : {}),
                      ...(locked ? styles.threadRowLocked : {}),
                      cursor: (moving || isCurrent) ? 'default' : 'pointer',
                    }}
                  >
                    <span style={{
                      ...styles.threadNode,
                      ...(isCurrent ? styles.threadNodeCurrent : {}),
                      background: isCurrent ? 'transparent' : '#FAF7F1',
                    }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={styles.threadBody}>
                      {isCurrent && <span style={styles.currentEyebrow}>Your current chapter</span>}
                      <span style={{
                        ...styles.threadLabel,
                        ...(isCurrent ? styles.threadLabelCurrent : {}),
                      }}>
                        {st.label}
                        {locked && <span style={styles.lockTag}> · unlocks at 30 days</span>}
                      </span>
                      <span style={{
                        ...styles.threadDesc,
                        ...(isCurrent ? styles.threadDescCurrent : {}),
                      }}>{st.desc}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* THE COLOPHON */}
        <button onClick={signOut} style={styles.colophon}>Sign out of this volume</button>

        <BottomNav />

        {sheet && (
          <div style={styles.sheetOverlay} onClick={() => { if (!moving) setSheet(null) }}>
            <div style={styles.sheetCard} onClick={(e) => e.stopPropagation()}>
              <h3 style={styles.sheetTitle}>{sheet.title}</h3>
              <p style={styles.sheetBody}>{sheet.body}</p>
              <div style={styles.sheetActions}>
                {sheet.actions.map((a, i) => (
                  <button
                    key={i}
                    onClick={a.run}
                    disabled={moving}
                    style={{ ...styles.sheetBtn, ...(a.primary ? styles.sheetBtnPrimary : a.danger ? styles.sheetBtnDanger : styles.sheetBtnGhost) }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS MODAL */}
        {showSettings && (
          <div style={styles.modal} onClick={() => setShowSettings(false)}>
            <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
              <p style={styles.modalTitle}>Settings</p>
              <button onClick={resetLang} style={styles.settingsRow}>
                <span>Language: {lang === 'hi' ? 'हिंदी' : 'English'}</span>
                <span style={{ color: '#9C8C78' }}>›</span>
              </button>
              <button onClick={() => setShowSettings(false)} style={styles.modalClose}>
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

const styles = {
  settingsLink: { background: 'transparent', border: 'none', color: '#9C8C78', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.18em', cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: '6px 4px' },

  frontispiece: { textAlign: 'center', padding: '1.5rem 0 1.75rem' },
  monogram: { width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#D9B57A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 auto 1.25rem', boxShadow: '0 6px 18px -4px rgba(40,25,10,0.4)' },
  nameBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, margin: '0 auto', display: 'inline-block' },
  frontName: { fontSize: '32px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.15, letterSpacing: '-0.015em', borderBottom: '1px dotted #C8AE83', paddingBottom: '3px' },
  nameEditWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  nameInput: { background: 'transparent', border: 'none', borderBottom: '1.5px solid #854F0B', fontSize: '26px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, textAlign: 'center', outline: 'none', padding: '2px 4px', width: '80%', maxWidth: '280px' },
  nameEditActions: { display: 'flex', gap: '20px', justifyContent: 'center' },
  nameSave: { background: 'transparent', border: 'none', color: '#854F0B', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  nameCancel: { background: 'transparent', border: 'none', color: '#9C8C78', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  frontEmail: { fontSize: '13px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0.9rem 0 0' },
  frontStage: { fontSize: '10px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 500, margin: '0.6rem 0 0', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },

  epigraphSection: { marginBottom: '1.5rem' },
  whyEditWrap: { marginTop: '0.5rem' },
  epigraph: { paddingLeft: '18px', borderLeft: '1.5px solid #D9B57A', marginTop: '0.85rem' },
  epigraphText: { fontSize: '16px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, margin: 0 },
  epigraphDropCap: { float: 'left', fontFamily: 'Georgia, serif', fontStyle: 'normal', fontSize: '44px', lineHeight: 0.85, color: '#854F0B', fontWeight: 500, margin: '4px 9px 0 0' },
  epigraphFooter: { display: 'flex', gap: '20px', marginTop: '1rem', paddingLeft: '18px' },
  epLink: { background: 'transparent', border: 'none', color: '#854F0B', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.14em', cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: 0 },
  epLinkMuted: { background: 'transparent', border: 'none', color: '#9C8C78', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.14em', cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: 0 },
  epEmptyBtn: { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '16px 18px', marginTop: '0.85rem', background: 'transparent', border: '1px dashed #D9C7A6', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' },
  epEmptyPlus: { fontSize: '20px', color: '#D9B57A', lineHeight: 1 },
  epEmptyText: { fontSize: '14px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic' },

  ledger: { display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 0 2rem', padding: '1.25rem 0', borderTop: '0.5px solid #E8DFD0', borderBottom: '0.5px solid #E8DFD0' },
  ledgerCol: { flex: 1, textAlign: 'center' },
  ledgerNum: { fontSize: '34px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: 0, lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
  ledgerWord: { fontSize: '24px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: 0, lineHeight: 1.1 },
  ledgerLabel: { fontSize: '10px', color: '#9C8C78', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 500, margin: '0.6rem 0 0', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  ledgerDivider: { width: '0.5px', alignSelf: 'stretch', background: '#E8DFD0' },

  moveRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', width: '100%', padding: '4px 2px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', marginTop: '0.5rem' },
  moveRowText: { display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: 0 },
  moveRowLabel: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500 },
  moveRowHelper: { fontSize: '12px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.45 },
  moveArrow: { fontSize: '18px', color: '#854F0B', flexShrink: 0 },

  threadWrap: { position: 'relative', paddingLeft: '2px', marginTop: '1rem' },
  thread: { position: 'absolute', left: '17px', top: '14px', bottom: '14px', width: '1.5px', background: '#D9B57A', opacity: 0.4, zIndex: 0 },
  threadRow: { position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: '14px', width: '100%', background: 'transparent', border: 'none', textAlign: 'left', padding: '11px 4px', fontFamily: 'inherit' },
  threadRowCurrent: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', borderRadius: '16px', padding: '16px', margin: '6px 0', boxShadow: '0 10px 24px -10px rgba(40,25,10,0.45)' },
  threadRowLocked: { opacity: 0.3 },
  threadNode: { width: '30px', flexShrink: 0, textAlign: 'center', fontSize: '12px', fontWeight: 500, color: '#854F0B', fontFamily: 'Georgia, serif', fontVariantNumeric: 'tabular-nums', lineHeight: '1.6', paddingTop: '1px' },
  threadNodeCurrent: { color: '#D9B57A' },
  threadBody: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '1px' },
  currentEyebrow: { fontSize: '10px', color: '#D9B57A', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  threadLabel: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.3 },
  threadLabelCurrent: { color: '#FAF7F1' },
  lockTag: { fontSize: '10px', color: '#9C8C78', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  threadDesc: { fontSize: '12px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.45 },
  threadDescCurrent: { color: '#CBBA98' },

  colophon: { display: 'block', margin: '2.5rem auto 1rem', background: 'transparent', border: 'none', color: '#9C8C78', fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.22em', cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },

  sheetOverlay: { position: 'fixed', inset: 0, background: 'rgba(36,23,16,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 },
  sheetCard: { width: '100%', maxWidth: '440px', background: '#FAF7F1', borderRadius: '24px 24px 0 0', padding: '24px 22px 28px', boxShadow: '0 -8px 40px rgba(40,25,10,0.25)' },
  sheetTitle: { fontSize: '20px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 10px' },
  sheetBody: { fontSize: '14.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 20px' },
  sheetActions: { display: 'flex', flexDirection: 'column', gap: '10px' },
  sheetBtn: { width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', border: 'none' },
  sheetBtnPrimary: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', boxShadow: '0 4px 14px rgba(40,25,10,0.22)' },
  sheetBtnDanger: { background: '#FBF1EC', color: '#B23B1E', border: '0.5px solid #E6C3B4' },
  sheetBtnGhost: { background: 'white', color: '#6B5C4A', border: '0.5px solid #DDCFB6' },
  stageNav: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' },
  stageRow: { display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left', padding: '12px', background: '#FFFFFF', border: '0.5px solid #E8DFD0', borderRadius: '14px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(80,50,20,0.04)' },
  stageRowCurrent: { background: 'linear-gradient(180deg, #FBF6EE 0%, #F4EAD8 100%)', border: '0.5px solid #D9C7A8', cursor: 'default' },
  stageRowLocked: { opacity: 0.72 },
  stageCircle: { width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: 'linear-gradient(180deg, #F4ECDD 0%, #EADFCB 100%)', border: '0.5px solid #E0D5C2' },
  stageCircleCurrent: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', border: '0.5px solid #241710' },
  stageBand: { flex: 1, minWidth: 0 },
  stageRowLabel: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 2px' },
  stageHereTag: { fontSize: '11px', color: '#854F0B', fontStyle: 'italic', fontWeight: 400 },
  stageLockTag: { fontSize: '11px', color: '#9C8C78', fontStyle: 'italic', fontWeight: 400 },
  stageRowDesc: { fontSize: '12px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.4, margin: 0 },
  frame: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)',
    padding: '2rem 1rem',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  phone: {
    background: '#FAF7F1',
    maxWidth: '440px',
    width: '100%',
    borderRadius: '28px',
    padding: '1.5rem 1.25rem 1.5rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  // TOP BAR
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  brandLine: {
    fontSize: '20px',
    fontWeight: 500,
    color: '#2A1F15',
    margin: 0,
    fontFamily: 'Georgia, serif',
    letterSpacing: '-0.01em',
  },
  gearBtn: {
    width: '34px',
    height: '34px',
    background: 'rgba(232,223,208,0.4)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '50%',
    color: '#6B5C4A',
    fontSize: '15px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    flexShrink: 0,
  },

  // IDENTITY CARD
  identityCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '20px',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '18px',
    boxShadow: '0 4px 16px rgba(80,50,20,0.05)',
  },
  avatar: {
    width: '54px',
    height: '54px',
    borderRadius: '50%',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    flexShrink: 0,
    boxShadow: '0 3px 10px rgba(40,25,10,0.2)',
  },
  identityText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingTop: '2px',
  },
  nameLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  nameText: {
    fontSize: '17px',
    fontWeight: 500,
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    letterSpacing: '-0.005em',
  },
  emailText: {
    fontSize: '12px',
    color: '#9C8C78',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: 'Georgia, serif',
  },
  stageBadge: {
    display: 'inline-block',
    marginTop: '8px',
    padding: '3px 11px',
    background: 'rgba(133,79,11,0.08)',
    color: '#854F0B',
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    borderRadius: '999px',
    fontFamily: 'Georgia, serif',
    border: '0.5px solid rgba(133,79,11,0.15)',
    alignSelf: 'flex-start',
  },
  editIcon: {
    background: 'transparent',
    border: 'none',
    color: '#9C8C78',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '0 4px',
    fontFamily: 'inherit',
    flexShrink: 0,
  },
  inlineInput: {
    flex: 1,
    padding: '6px 10px',
    borderRadius: '8px',
    border: '0.5px solid #DDCFB6',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    minWidth: 0,
  },
  miniBtn: {
    padding: '6px 10px',
    borderRadius: '8px',
    border: 'none',
    background: '#3A2A1C',
    color: '#FAF7F1',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '12px',
    flexShrink: 0,
  },
  miniBtnSecondary: {
    padding: '6px 10px',
    borderRadius: '8px',
    border: '0.5px solid #DDCFB6',
    background: 'white',
    color: '#2A1F15',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '12px',
    flexShrink: 0,
  },

  // SECTIONS
  section: {},
  sectionLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    color: '#9C8C78',
    margin: '0 0 10px',
    fontWeight: 500,
    paddingLeft: '4px',
    fontFamily: 'Georgia, serif',
  },

  // WHY SECTION
  whySection: {},
  whyCard: {
    background: 'linear-gradient(180deg, #2A1F15 0%, #1A1208 100%)',
    border: '0.5px solid #3A2A1C',
    borderRadius: '18px',
    padding: '1.5rem 1.5rem 1.25rem',
    boxShadow: '0 6px 20px rgba(20,12,5,0.25), inset 0 1px 0 rgba(212,175,100,0.08)',
  },
  whyText: {
    fontSize: '14px',
    color: '#D4AF64',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.75,
    margin: 0,
    whiteSpace: 'pre-wrap',
    letterSpacing: '0.01em',
  },
  whyFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
    paddingTop: '0.875rem',
    borderTop: '0.5px solid rgba(212,175,100,0.2)',
  },
  whyLink: {
    background: 'transparent',
    border: 'none',
    padding: 0,
    color: '#D4AF64',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.02em',
  },
  whyLinkMuted: {
    background: 'transparent',
    border: 'none',
    padding: 0,
    color: 'rgba(212,175,100,0.55)',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
    letterSpacing: '0.02em',
  },
  whyEmptyBtn: {
    width: '100%',
    padding: '24px',
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F6EFDD 100%)',
    border: '1px dashed #C9B894',
    borderRadius: '18px',
    color: '#854F0B',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
    fontSize: '14px',
    fontWeight: 500,
    fontStyle: 'italic',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whyEditCard: {
    background: 'white',
    border: '0.5px solid #E8DCC2',
    borderRadius: '18px',
    padding: '14px',
  },
  whyTextarea: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '0.5px solid #DDCFB6',
    background: '#FDFBF6',
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    boxSizing: 'border-box',
    outline: 'none',
    minHeight: '140px',
    resize: 'vertical',
    lineHeight: 1.6,
    fontStyle: 'italic',
  },
  whyEditActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '10px',
  },
  btnGhost: {
    padding: '8px 14px',
    borderRadius: '999px',
    background: 'transparent',
    color: '#6B5C4A',
    border: '0.5px solid #DDCFB6',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnDark: {
    padding: '8px 18px',
    borderRadius: '999px',
    background: '#3A2A1C',
    color: '#FAF7F1',
    border: 'none',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },

  // YOUR PATH
  pathLinks: {
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(80,50,20,0.04)',
  },
  pathRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '16px 18px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
  },
  pathRowText: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  pathRowLabel: {
    fontSize: '14px',
    color: '#2A1F15',
    fontWeight: 500,
    margin: 0,
    fontFamily: 'Georgia, serif',
    lineHeight: 1.3,
  },
  pathRowHelper: {
    fontSize: '11px',
    color: '#9C8C78',
    fontStyle: 'italic',
    margin: 0,
    fontFamily: 'Georgia, serif',
    lineHeight: 1.4,
  },
  linkArrow: {
    color: '#9C8C78',
    fontSize: '18px',
    flexShrink: 0,
  },
  linkDivider: {
    height: '0.5px',
    background: '#EFE7D7',
    margin: '0 18px',
  },

  // MODAL
  modal: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(40,25,15,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 100,
    backdropFilter: 'blur(4px)',
  },
  modalCard: {
    background: '#FAF7F1',
    maxWidth: '360px',
    width: '100%',
    borderRadius: '20px',
    padding: '1.5rem',
    boxShadow: '0 20px 60px rgba(40,25,15,0.3)',
  },
  modalTitle: {
    fontSize: '17px',
    fontWeight: 500,
    color: '#2A1F15',
    margin: '0 0 1rem',
    fontFamily: 'Georgia, serif',
  },
  settingsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    padding: '14px 4px',
    border: 'none',
    background: 'transparent',
    fontSize: '13px',
    color: '#2A1F15',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
  },
  modalClose: {
    width: '100%',
    padding: '12px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginTop: '1rem',
  },
}