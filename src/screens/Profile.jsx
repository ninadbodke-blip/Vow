import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLang } from '../LanguageContext'
import { supabase } from '../supabaseClient'
import BottomNav from '../components/BottomNav'
import VowBrandMark from '../components/VowBrandMark'
import { createStageMove } from './freeHome/stageMove'

// ===================================================================
// PROFILE — you, plainly.
// ===================================================================
// No hero here on purpose. Who you are, why you started, where you
// stand, and the door to every stage. Everything in plain words.
// Stage-move side-effects run through the shared stageMove module so
// this screen and the home wayfinder behave identically.
// ===================================================================

const STAGE_LABELS = {
  notice: 'A closer look',
  reflect: 'Weighing it up',
  commit: 'Getting ready',
  endure: 'Early days',
  build: 'Staying steady',
  reclaim: 'Getting back up',
}

// Journey order. Reclaim is reachable here; Build respects the 30-day gate.
const STAGE_META = [
  { key: 'notice',  label: 'A closer look',   desc: 'Just watching the pattern. No pressure to change yet.' },
  { key: 'reflect', label: 'Weighing it up',  desc: 'Looking honestly at what it is costing you.' },
  { key: 'commit',  label: 'Getting ready',   desc: 'Picking your day. Clearing the path to it.' },
  { key: 'endure',  label: 'Early days',      desc: 'The early stretch. Holding the line, day by day.' },
  { key: 'build',   label: 'Staying steady',  desc: 'Past the hardest stretch. Protecting what you built.' },
  { key: 'reclaim', label: 'Getting back up', desc: 'Back after a slip. Nothing you built is lost.' },
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
        if (!u) { navigate('/app/signup'); return }
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
  // Build unlocks only on genuinely-held days. (Being in Reclaim no longer
  // grants it — that was a side-door past the 30-day gate. Entering Reclaim
  // resets the counter, so a returner re-earns the days.)
  const buildUnlocked = stage === 'build' || daysOnTracker >= 30

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
    navigate('/app/welcome')
  }

  if (loading) {
    return (
      <div style={styles.frame}>
        <div style={{ ...styles.phone, textAlign: 'center', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          One moment…
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
          <div style={{ width: '40px' }} />
          <span style={styles.brandCenter}><VowBrandMark size={17} /></span>
          <button onClick={() => setShowSettings(true)} style={styles.settingsLink} aria-label="Settings">
            Settings
          </button>
        </div>

        {/* YOU */}
        <div style={styles.identity}>
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
                <button onClick={saveName} style={styles.smallLink}>Save</button>
                <button
                  onClick={() => { setEditingName(false); setNameDraft(profile?.full_name || '') }}
                  style={styles.smallLinkMuted}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <button onClick={() => setEditingName(true)} style={styles.nameBtn} aria-label="Edit name">
                <span style={styles.name}>{profile?.full_name || 'Your name'}</span>
              </button>
              <p style={styles.email}>{user?.email}</p>
              {stage && <span style={styles.stageChip}>{STAGE_LABELS[stage]}</span>}
            </>
          )}
        </div>

        {/* WHY I STARTED */}
        <div>
          <p style={styles.sectionLabel}>Why I started</p>
          {editingWhy ? (
            <div style={styles.whyEditWrap}>
              <textarea
                value={whyDraft}
                onChange={(e) => setWhyDraft(e.target.value)}
                placeholder="What brought you here. You will want to read it on the hard days…"
                style={styles.whyTextarea}
                autoFocus
                maxLength={3000}
              />
              <div style={styles.whyEditActions}>
                <button
                  onClick={() => { setEditingWhy(false); setWhyDraft(profile?.bio || '') }}
                  style={styles.smallLinkMuted}
                >
                  Cancel
                </button>
                <button onClick={saveWhy} style={styles.smallLink}>Save</button>
              </div>
            </div>
          ) : fullBio ? (
            <div style={styles.whyCard}>
              <p style={styles.whyText}>
                <span style={styles.whyDropCap}>{(showFullWhy ? fullBio : bioPreview).charAt(0)}</span>
                {(showFullWhy ? fullBio : (bioPreview + (hasMore ? '…' : ''))).slice(1)}
              </p>
              <div style={styles.whyFooter}>
                {hasMore && (
                  <button onClick={() => setShowFullWhy(!showFullWhy)} style={styles.smallLink}>
                    {showFullWhy ? 'Show less' : 'Read more'}
                  </button>
                )}
                <button onClick={() => setEditingWhy(true)} style={styles.smallLinkMuted}>
                  Edit
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setEditingWhy(true)} style={styles.whyEmptyBtn}>
              <span style={styles.whyEmptyPlus}>+</span>
              <span style={styles.whyEmptyText}>Write down why you started…</span>
            </button>
          )}
        </div>

        {/* WHERE YOU STAND */}
        {stage && (
          <div style={styles.ledger}>
            <div style={styles.ledgerCol}>
              <p style={styles.ledgerNum}>{daysOnTracker}</p>
              <p style={styles.ledgerLabel}>Days on the path</p>
            </div>
            <div style={styles.ledgerDivider} />
            <div style={styles.ledgerCol}>
              <p style={styles.ledgerWord}>{STAGE_LABELS[stage]}</p>
              <p style={styles.ledgerLabel}>Where you are</p>
            </div>
          </div>
        )}

        {/* YOUR PATH */}
        <div>
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
                      {isCurrent && <span style={styles.currentEyebrow}>You are here</span>}
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

        {/* LOOKING BACK — slip & urge history */}
        <div>
          <p style={styles.sectionLabel}>Looking back</p>
          <div style={styles.accountCard}>
            <button onClick={() => navigate('/app/slips')} style={{ ...styles.accountRow, width: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <span style={styles.accountLabel}>Slip history</span>
              <span style={styles.accountArrow}>›</span>
            </button>
            <div style={styles.accountDivider} />
            <button onClick={() => navigate('/app/urges')} style={{ ...styles.accountRow, width: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <span style={styles.accountLabel}>Urge log</span>
              <span style={styles.accountArrow}>›</span>
            </button>
          </div>
        </div>

        {/* ACCOUNT */}
        <div>
          <p style={styles.sectionLabel}>Account</p>
          <div style={styles.accountCard}>
            <Link to="/privacy" style={styles.accountRow}>
              <span style={styles.accountLabel}>Privacy</span>
              <span style={styles.accountArrow}>›</span>
            </Link>
            <div style={styles.accountDivider} />
            <Link to="/terms" style={styles.accountRow}>
              <span style={styles.accountLabel}>Terms</span>
              <span style={styles.accountArrow}>›</span>
            </Link>
            <div style={styles.accountDivider} />
            <button onClick={signOut} style={{ ...styles.accountRow, width: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <span style={styles.accountSignOut}>Sign out</span>
            </button>
          </div>
        </div>

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

        {/* SETTINGS */}
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
  frame: { minHeight: '100vh', background: 'linear-gradient(180deg, #FDFBF6 0%, #F6EFDD 100%)', padding: '1.25rem 1rem 2rem', display: 'flex', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  phone: { maxWidth: '440px', width: '100%', display: 'flex', flexDirection: 'column', gap: '18px' },

  topBar: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brandCenter: { position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', pointerEvents: 'none' },
  settingsLink: { background: 'transparent', border: 'none', color: '#854F0B', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.16em', cursor: 'pointer', fontFamily: 'inherit', padding: '6px 4px' },

  identity: { textAlign: 'center', padding: '0.75rem 0 0.25rem' },
  monogram: { width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#D9B57A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 auto 1.1rem', boxShadow: '0 6px 18px -4px rgba(40,25,10,0.4)' },
  nameBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, margin: '0 auto', display: 'inline-block' },
  name: { fontSize: '28px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.15, letterSpacing: '-0.015em', borderBottom: '1px dotted #C8AE83', paddingBottom: '3px' },
  email: { fontSize: '13px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0.8rem 0 0' },
  stageChip: { display: 'inline-block', marginTop: '10px', padding: '4px 13px', background: 'rgba(133,79,11,0.08)', color: '#854F0B', fontSize: '10px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', borderRadius: '999px', fontFamily: 'Georgia, serif', border: '0.5px solid rgba(133,79,11,0.15)' },
  nameEditWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  nameInput: { background: 'transparent', border: 'none', borderBottom: '1.5px solid #854F0B', fontSize: '24px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, textAlign: 'center', outline: 'none', padding: '2px 4px', width: '80%', maxWidth: '280px' },
  nameEditActions: { display: 'flex', gap: '20px', justifyContent: 'center' },

  sectionLabel: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.16em', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0 2px 9px' },
  smallLink: { background: 'transparent', border: 'none', color: '#854F0B', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.14em', cursor: 'pointer', fontFamily: 'inherit', padding: 0 },
  smallLinkMuted: { background: 'transparent', border: 'none', color: '#9C8C78', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.14em', cursor: 'pointer', fontFamily: 'inherit', padding: 0 },

  whyCard: { background: '#FBF7EE', border: '0.5px solid #E5D9C2', borderRadius: '16px', padding: '18px 18px 14px', boxShadow: '0 3px 14px rgba(120,90,40,0.07)' },
  whyText: { fontSize: '15.5px', color: '#3F3528', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' },
  whyDropCap: { float: 'left', fontFamily: 'Georgia, serif', fontStyle: 'normal', fontSize: '42px', lineHeight: 0.85, color: '#854F0B', fontWeight: 500, margin: '4px 9px 0 0' },
  whyFooter: { display: 'flex', justifyContent: 'flex-end', gap: '18px', marginTop: '12px', paddingTop: '10px', borderTop: '0.5px solid #EFE3CC' },
  whyEmptyBtn: { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '16px 18px', background: 'transparent', border: '1px dashed #D9C7A6', borderRadius: '14px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' },
  whyEmptyPlus: { fontSize: '20px', color: '#D9B57A', lineHeight: 1 },
  whyEmptyText: { fontSize: '14px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  whyEditWrap: {},
  whyTextarea: { width: '100%', padding: '13px 14px', borderRadius: '14px', border: '0.5px solid #E2D7C3', background: '#FDFBF6', fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', boxSizing: 'border-box', outline: 'none', minHeight: '130px', resize: 'vertical', lineHeight: 1.6 },
  whyEditActions: { display: 'flex', justifyContent: 'flex-end', gap: '18px', marginTop: '10px' },

  ledger: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.1rem 0', borderTop: '0.5px solid #E8DFD0', borderBottom: '0.5px solid #E8DFD0' },
  ledgerCol: { flex: 1, textAlign: 'center' },
  ledgerNum: { fontSize: '32px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: 0, lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
  ledgerWord: { fontSize: '22px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: 0, lineHeight: 1.1 },
  ledgerLabel: { fontSize: '10px', color: '#9C8C78', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 500, margin: '0.55rem 0 0', fontFamily: 'inherit' },
  ledgerDivider: { width: '0.5px', alignSelf: 'stretch', background: '#E8DFD0' },

  moveRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', width: '100%', padding: '13px 14px', background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: '16px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' },
  moveRowText: { display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: 0 },
  moveRowLabel: { fontSize: '14.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500 },
  moveRowHelper: { fontSize: '12px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.45 },
  moveArrow: { fontSize: '18px', color: '#854F0B', flexShrink: 0 },

  threadWrap: { position: 'relative', paddingLeft: '2px', marginTop: '12px' },
  thread: { position: 'absolute', left: '17px', top: '14px', bottom: '14px', width: '1.5px', background: '#D9B57A', opacity: 0.4, zIndex: 0 },
  threadRow: { position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: '14px', width: '100%', background: 'transparent', border: 'none', textAlign: 'left', padding: '11px 4px', fontFamily: 'inherit' },
  threadRowCurrent: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', borderRadius: '16px', padding: '16px', margin: '6px 0', boxShadow: '0 10px 24px -10px rgba(40,25,10,0.45)' },
  threadRowLocked: { opacity: 0.3 },
  threadNode: { width: '30px', flexShrink: 0, textAlign: 'center', fontSize: '12px', fontWeight: 500, color: '#854F0B', fontFamily: 'Georgia, serif', fontVariantNumeric: 'tabular-nums', lineHeight: '1.6', paddingTop: '1px' },
  threadNodeCurrent: { color: '#D9B57A' },
  threadBody: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '1px' },
  currentEyebrow: { fontSize: '10px', color: '#D9B57A', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, fontFamily: 'inherit' },
  threadLabel: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.3 },
  threadLabelCurrent: { color: '#FAF7F1' },
  lockTag: { fontSize: '10px', color: '#9C8C78', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500, fontFamily: 'inherit' },
  threadDesc: { fontSize: '12px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.45 },
  threadDescCurrent: { color: '#CBBA98' },

  accountCard: { background: '#FDFBF6', border: '0.5px solid #E8DFD0', borderRadius: '16px', overflow: 'hidden' },
  accountRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', textDecoration: 'none', fontFamily: 'inherit', textAlign: 'left' },
  accountLabel: { fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500 },
  accountArrow: { fontSize: '17px', color: '#9C8C78' },
  accountDivider: { height: '0.5px', background: '#EFE7D7', margin: '0 16px' },
  accountSignOut: { fontSize: '14px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontWeight: 500 },

  sheetOverlay: { position: 'fixed', inset: 0, background: 'rgba(36,23,16,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 },
  sheetCard: { width: '100%', maxWidth: '440px', background: '#FAF7F1', borderRadius: '24px 24px 0 0', padding: '24px 22px 28px', boxShadow: '0 -8px 40px rgba(40,25,10,0.25)' },
  sheetTitle: { fontSize: '20px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 10px' },
  sheetBody: { fontSize: '14.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 20px' },
  sheetActions: { display: 'flex', flexDirection: 'column', gap: '10px' },
  sheetBtn: { width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', border: 'none' },
  sheetBtnPrimary: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', boxShadow: '0 4px 14px rgba(40,25,10,0.22)' },
  sheetBtnDanger: { background: '#FBF1EC', color: '#B23B1E', border: '0.5px solid #E6C3B4' },
  sheetBtnGhost: { background: 'white', color: '#6B5C4A', border: '0.5px solid #DDCFB6' },

  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(40,25,15,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100, backdropFilter: 'blur(4px)' },
  modalCard: { background: '#FAF7F1', maxWidth: '360px', width: '100%', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 20px 60px rgba(40,25,15,0.3)' },
  modalTitle: { fontSize: '17px', fontWeight: 500, color: '#2A1F15', margin: '0 0 1rem', fontFamily: 'Georgia, serif' },
  settingsRow: { display: 'flex', justifyContent: 'space-between', width: '100%', padding: '14px 4px', border: 'none', background: 'transparent', fontSize: '13px', color: '#2A1F15', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' },
  modalClose: { width: '100%', padding: '12px', background: 'white', color: '#2A1F15', border: '0.5px solid #DDCFB6', borderRadius: '12px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', marginTop: '1rem' },
}