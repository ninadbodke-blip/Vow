import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLang } from '../LanguageContext'
import { supabase } from '../supabaseClient'
import BottomNav from '../components/BottomNav'
import VowBrandMark from '../components/VowBrandMark'
import { createStageMove } from './freeHome/stageMove'
import { MedallionArt } from './vowPath/overviewKit'

// Tiny drawn glyphs tying the profile to the path's visual language — decoration only.
const STAGE_GLYPHS = { notice: 'eye', reflect: 'scales', commit: 'seal', endure: 'sunrise', build: 'tree', reclaim: 'lantern' }
const Glyph = ({ kind, size = 26 }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" style={{ flex: `0 0 ${size}px` }}>
    <MedallionArt kind={kind} />
  </svg>
)
const Sprig = () => (
  <svg viewBox="0 0 90 14" width="84" height="13" aria-hidden="true" style={{ display: 'block', margin: '0.9rem auto 0' }}>
    <path d="M4 7 H34 M56 7 H86" stroke="#D9B57A" strokeWidth="0.8" opacity="0.7" />
    <path d="M45 11 C41 9 39 5 40 2 C43 3 45 6 45 11 M45 9 C47 6 50 4 52 5 C51 8 48 9 45 9" fill="#93A36B" />
  </svg>
)


// ===================================================================
// PROFILE — you, plainly. Minimal on purpose.
// ===================================================================
// No graphics, no ornament: name, why you started, where you stand,
// the door to every stage, your history, and the account rows.
// Stage-move side-effects run through the shared stageMove module so
// this screen and the home wayfinder behave identically — including
// the resume-not-restart guarantee for a begun Early days streak.
// ===================================================================

const STAGE_LABELS = {
  notice: 'A closer look',
  reflect: 'Weighing it up',
  commit: 'Getting ready',
  endure: 'Early days',
  build: 'Staying steady',
  reclaim: 'Getting back up',
}

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
  // Build unlocks only on genuinely-held days.
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

  // An anonymous session has no email/password to sign back in with, so
  // signing out is unrecoverable — unlike a saved account, where it's routine.
  const handleSignOutTap = () => {
    if (!user?.is_anonymous) { signOut(); return }
    setSheet({
      title: 'This will lose your progress',
      body: "You haven't saved your account yet. Signing out now means there's no way back to this streak — save it first, or go ahead if you're sure.",
      actions: [
        { label: 'Save my progress first', primary: true, run: () => { setSheet(null); navigate('/app/signup') } },
        { label: 'Sign out anyway', danger: true, run: signOut },
        { label: 'Cancel', run: () => setSheet(null) },
      ],
    })
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

        {/* TOP */}
        <div style={styles.topBar}>
          <VowBrandMark size={16} />
        </div>

        {/* YOU */}
        <div style={styles.identity}>
          {editingName ? (
            <div style={styles.nameEditWrap}>
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                style={styles.nameInput}
                autoFocus
              />
              <div style={styles.editActions}>
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
              {user?.is_anonymous ? (
                <button onClick={() => navigate('/app/signup')} style={styles.savePrompt}>
                  Progress not saved yet — tap to secure it
                </button>
              ) : (
                <p style={styles.email}>{user?.email}</p>
              )}
            </>
          )}
          <Sprig />
        </div>

        {/* WHERE YOU STAND */}
        {stage && (
          <div style={styles.standWrap}>
            <Glyph kind={STAGE_GLYPHS[stage] || 'sprig'} size={24} />
            <p style={styles.standLine}>
              Day {daysOnTracker} · {STAGE_LABELS[stage]}
            </p>
          </div>
        )}

        {/* WHY I STARTED */}
        <div>
          <p style={styles.sectionLabel}>Why I started</p>
          {editingWhy ? (
            <div>
              <textarea
                value={whyDraft}
                onChange={(e) => setWhyDraft(e.target.value)}
                placeholder="What brought you here. You will want to read it on the hard days…"
                style={styles.whyTextarea}
                autoFocus
                maxLength={3000}
              />
              <div style={{ ...styles.editActions, justifyContent: 'flex-end', marginTop: 8 }}>
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
            <div style={styles.card}>
              <p style={styles.whyText}>
                {showFullWhy ? fullBio : (bioPreview + (hasMore ? '…' : ''))}
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
              Write down why you started…
            </button>
          )}
        </div>

        {/* YOUR PATH */}
        <div>
          <p style={styles.sectionLabel}>Your path</p>
          <div style={styles.card}>
            <button onClick={() => setShowStages(s => !s)} style={styles.row}>
              <span style={styles.rowLabel}>Move to a different stage</span>
              <span style={styles.rowArrow}>{showStages ? '⌄' : '›'}</span>
            </button>
            {showStages && STAGE_META.map((st) => {
              const isCurrent = st.key === stage
              const locked = st.key === 'build' && !buildUnlocked
              return (
                <div key={st.key}>
                  <div style={styles.divider} />
                  <button
                    onClick={() => goToStage(st.key)}
                    disabled={moving || isCurrent}
                    style={{ ...styles.stageRow, cursor: (moving || isCurrent) ? 'default' : 'pointer', opacity: locked ? 0.55 : 1 }}
                  >
                    <Glyph kind={STAGE_GLYPHS[st.key] || 'sprig'} size={26} />
                    <span style={styles.stageRowBody}>
                      <span style={{ ...styles.stageRowLabel, ...(isCurrent ? styles.stageRowLabelCurrent : {}) }}>
                        {st.label}
                        {isCurrent && ' · you are here'}
                        {locked && ' · unlocks at 30 days'}
                      </span>
                      <span style={styles.stageRowDesc}>{st.desc}</span>
                    </span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* LOOKING BACK */}
        <div>
          <p style={styles.sectionLabel}>Looking back</p>
          <div style={styles.card}>
            <button onClick={() => navigate('/app/slips')} style={styles.row}>
              <span style={styles.rowLead}><Glyph kind="journal" size={22} /><span style={styles.rowLabel}>Slip history</span></span>
              <span style={styles.rowArrow}>›</span>
            </button>
            <div style={styles.divider} />
            <button onClick={() => navigate('/app/urges')} style={styles.row}>
              <span style={styles.rowLead}><Glyph kind="drift" size={22} /><span style={styles.rowLabel}>Urge log</span></span>
              <span style={styles.rowArrow}>›</span>
            </button>
          </div>
        </div>

        {/* ACCOUNT */}
        <div>
          <p style={styles.sectionLabel}>Account</p>
          <div style={styles.card}>
            <button onClick={resetLang} style={styles.row}>
              <span style={styles.rowLabel}>Language · {lang === 'hi' ? 'हिंदी' : 'English'}</span>
              <span style={styles.rowArrow}>›</span>
            </button>
            <div style={styles.divider} />
            <Link to="/about" style={styles.row}>
              <span style={styles.rowLabel}>About</span>
              <span style={styles.rowArrow}>›</span>
            </Link>
            <div style={styles.divider} />
            <Link to="/contact" style={styles.row}>
              <span style={styles.rowLabel}>Contact</span>
              <span style={styles.rowArrow}>›</span>
            </Link>
            <div style={styles.divider} />
            <Link to="/terms" style={styles.row}>
              <span style={styles.rowLabel}>Terms</span>
              <span style={styles.rowArrow}>›</span>
            </Link>
            <div style={styles.divider} />
            <Link to="/privacy" style={styles.row}>
              <span style={styles.rowLabel}>Privacy</span>
              <span style={styles.rowArrow}>›</span>
            </Link>
            <div style={styles.divider} />
            <Link to="/refund" style={styles.row}>
              <span style={styles.rowLabel}>Refunds</span>
              <span style={styles.rowArrow}>›</span>
            </Link>
            <div style={styles.divider} />
            <button onClick={handleSignOutTap} style={styles.row}>
              <span style={styles.signOut}>Sign out</span>
            </button>
          </div>

          <div style={styles.legalFootnote}>
            <p style={styles.legalFootnoteName}>Vow Labs · Proprietor: Ninad Arun Bodke</p>
            <p style={styles.legalFootnoteLine}>Udyam-registered MSME · Mumbai, India</p>
            <p style={styles.legalFootnoteLine}>vowapp.in · hello@vowapp.in</p>
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

      </div>
    </div>
  )
}

const styles = {
  frame: { minHeight: '100vh', background: 'radial-gradient(900px 420px at 50% -8%, rgba(217,181,122,0.14), transparent 60%), linear-gradient(180deg, #FAF7F1 0%, #F6F0E4 100%)', padding: '1.25rem 1rem 2rem', display: 'flex', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  phone: { maxWidth: '440px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' },

  topBar: { display: 'flex', justifyContent: 'center' },

  identity: { textAlign: 'center', paddingTop: '0.5rem' },
  nameBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, margin: '0 auto', display: 'inline-block' },
  name: { fontSize: '26px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.15, letterSpacing: '-0.015em', borderBottom: '1px dotted #C8AE83', paddingBottom: '3px' },
  email: { fontSize: '13px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0.6rem 0 0' },
  savePrompt: { fontSize: '12.5px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0.6rem 0 0', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', textDecoration: 'underline', textUnderlineOffset: '2px' },
  nameEditWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  nameInput: { background: 'transparent', border: 'none', borderBottom: '1.5px solid #854F0B', fontSize: '22px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, textAlign: 'center', outline: 'none', padding: '2px 4px', width: '80%', maxWidth: '280px' },
  editActions: { display: 'flex', gap: '20px', justifyContent: 'center' },

  standWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px', padding: '9px 18px', margin: '0 auto', width: 'fit-content', border: '0.5px solid #EBDFC9', borderRadius: '999px', background: 'linear-gradient(180deg, #FDFBF6 0%, #FBF6EC 100%)' },
  standLine: { textAlign: 'center', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '14px', color: '#854F0B', margin: 0 },

  sectionLabel: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.16em', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0 2px 8px' },
  smallLink: { background: 'transparent', border: 'none', color: '#854F0B', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.14em', cursor: 'pointer', fontFamily: 'inherit', padding: 0 },
  smallLinkMuted: { background: 'transparent', border: 'none', color: '#9C8C78', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.14em', cursor: 'pointer', fontFamily: 'inherit', padding: 0 },

  card: { background: 'linear-gradient(180deg, #FDFBF6 0%, #FBF6EC 100%)', border: '0.5px solid #EBDFC9', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 20px -16px rgba(90,65,35,0.35)' },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '13px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', textAlign: 'left' },
  rowLead: { display: 'flex', alignItems: 'center', gap: '10px' },
  rowLabel: { fontSize: '14px', color: '#2A1F15' },
  rowArrow: { fontSize: '15px', color: '#9C8C78' },
  divider: { height: '0.5px', background: '#EFE7D8', margin: '0 16px' },
  signOut: { fontSize: '14px', color: '#854F0B' },

  whyText: { fontSize: '15px', color: '#3F3528', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.7, margin: '14px 16px 0', whiteSpace: 'pre-wrap', padding: '0 0 0 12px', borderLeft: '2px solid #E4D4B4' },
  whyFooter: { display: 'flex', justifyContent: 'flex-end', gap: '18px', padding: '10px 16px 12px' },
  whyEmptyBtn: { width: '100%', padding: '15px 16px', background: 'transparent', border: '1px dashed #D9C7A6', borderRadius: '14px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '14px', color: '#9C8C78', textAlign: 'left' },
  whyTextarea: { width: '100%', boxSizing: 'border-box', minHeight: '120px', padding: '13px 15px', borderRadius: '14px', border: '0.5px solid #E2D7C3', background: '#FDFBF6', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '14.5px', color: '#2A1F15', outline: 'none', resize: 'vertical', lineHeight: 1.6 },

  stageRow: { display: 'flex', alignItems: 'center', gap: '11px', width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', fontFamily: 'inherit', textAlign: 'left' },
  stageRowBody: { display: 'flex', flexDirection: 'column', gap: '2px' },
  stageRowLabel: { fontSize: '14px', color: '#2A1F15' },
  stageRowLabelCurrent: { color: '#854F0B', fontWeight: 600 },
  stageRowDesc: { fontSize: '12px', color: '#9C8C78', lineHeight: 1.45 },

  legalFootnote: { textAlign: 'center', marginTop: '14px' },
  legalFootnoteName: { fontSize: '11px', color: '#9C8C78', margin: 0 },
  legalFootnoteLine: { fontSize: '11px', color: '#B8A88E', margin: '2px 0 0' },

  sheetOverlay: { position: 'fixed', inset: 0, background: 'rgba(42,31,21,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 60 },
  sheetCard: { background: '#FDFBF6', borderRadius: '20px 20px 0 0', padding: '22px 20px 26px', width: '100%', maxWidth: '440px', boxSizing: 'border-box' },
  sheetTitle: { fontFamily: 'Georgia, serif', fontSize: '18px', color: '#2A1F15', margin: '0 0 8px', fontWeight: 500 },
  sheetBody: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '13.5px', color: '#6B5C4A', lineHeight: 1.6, margin: '0 0 16px' },
  sheetActions: { display: 'flex', flexDirection: 'column', gap: '8px' },
  sheetBtn: { width: '100%', padding: '13px 14px', borderRadius: '13px', fontSize: '14px', fontFamily: 'inherit', cursor: 'pointer' },
  sheetBtnPrimary: { background: '#854F0B', color: '#F6E8C4', border: 'none', fontWeight: 600 },
  sheetBtnDanger: { background: 'transparent', color: '#8C3B2E', border: '0.5px solid rgba(140,59,46,0.35)' },
  sheetBtnGhost: { background: 'transparent', color: '#6B5C4A', border: '0.5px solid #E2D7C3' },
}