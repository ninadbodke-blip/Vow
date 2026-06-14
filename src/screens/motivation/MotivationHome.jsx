import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTodayQuote } from './data/quotes'
import { ARTICLES } from './data/articles'
import { supabase } from '../../supabaseClient'
import BottomNav from '../../components/BottomNav'
import VowPathInvite from '../freeHome/VowPathInvite'
import NightSky from './NightSky'
import VowBrandMark from '../../components/VowBrandMark'
import { THEMES, THEME_MAP } from './data/themes'

// =====================================================================
// MOTIVATION — "The Antidote to Amnesia."
// Relapse isn't a lack of hype; it's a moment of forgetting. This tab
// hands a person their own reasons back, exactly when the brain tries to
// erase them. Built from real data: their Vow, their cost, their Anchors,
// their streak — plus a curated library re-shaped as a medicine cabinet.
//   · The Primary Artifact — their own Vow, as the hero
//   · The Override        — a full-screen break-glass intervention
//   · From the Architects — the daily inherited quote (demoted)
//   · The Apothecary      — essays filtered by tonight's "weather"
// =====================================================================

// Relationship glyphs (mirrors Anchors.jsx)
const REL_ICON = { mother: '👩', father: '👨', partner: '💑', sibling: '👫', friend: '🤝', sponsor: '🪶', counselor: '🧘', other: '⚓' }
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')
const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN')

// The Apothecary — maps tonight's "weather" to the essays that treat it.
// Edit freely; slugs come from data/articles.js. Essays not listed here are
// still reachable under "All".
const ProfileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
)

// --- THE OVERRIDE — full-screen, tap-to-advance intervention -----------------
function OverrideFlow({ vow, costLine, anchors, daysFree, onClose, onLog }) {
  const steps = []
  steps.push({ type: 'breathe' })
  if (costLine) steps.push({ type: 'text', eyebrow: 'The real cost', big: costLine })
  if (anchors && anchors.length) steps.push({ type: 'anchors' })
  if (daysFree != null) steps.push({ type: 'streak' })
  if (vow) steps.push({ type: 'vow' })
  steps.push({ type: 'close' })

  const [i, setI] = useState(0)
  const step = steps[i]
  const advance = () => { if (step.type !== 'close' && i < steps.length - 1) setI(i + 1) }

  return (
    <div style={oStyles.overlay} onClick={advance}>
      <style>{`@keyframes vowBreathe { 0%,100% { transform: scale(0.82); opacity: 0.35 } 50% { transform: scale(1.08); opacity: 0.85 } }`}</style>

      <div style={oStyles.inner}>
        {step.type === 'breathe' && (
          <>
            <div style={oStyles.breatheWrap}><div style={oStyles.breatheRing} /></div>
            <p style={oStyles.big}>Breathe.</p>
            <p style={oStyles.sub}>The urge is a spike — not a baseline. Let it rise, and let it pass. You only have to outlast the next few minutes.</p>
          </>
        )}
        {step.type === 'text' && (
          <>
            <p style={oStyles.eyebrow}>{step.eyebrow}</p>
            <p style={oStyles.bigBody}>{step.big}</p>
          </>
        )}
        {step.type === 'anchors' && (
          <>
            <p style={oStyles.eyebrow}>Who is in this with you</p>
            <div style={oStyles.anchorWrap}>
              {anchors.slice(0, 3).map((a, idx) => (
                <div key={idx} style={oStyles.anchorChip}>
                  <span style={oStyles.anchorIcon}>{REL_ICON[a.relationship] || '⚓'}</span>
                  <span style={oStyles.anchorName}>{a.name}</span>
                  <span style={oStyles.anchorRel}>{cap(a.relationship)}</span>
                </div>
              ))}
            </div>
            <p style={oStyles.sub}>They are still on the other side of tonight. So are you.</p>
          </>
        )}
        {step.type === 'streak' && (
          <>
            <p style={oStyles.eyebrow}>The ground you've held</p>
            {daysFree === 0 ? (
              <p style={oStyles.bigBody}>This is Day One — the hardest one. Don't let the next ten minutes make it Day Zero again.</p>
            ) : (
              <><p style={oStyles.streakNum}>{daysFree}</p><p style={oStyles.bigBody}>{daysFree === 1 ? 'day' : 'days'}, held. Don't trade them for ten minutes you won't even remember.</p></>
            )}
          </>
        )}
        {step.type === 'vow' && (
          <>
            <p style={oStyles.eyebrow}>You wrote this, clear-eyed</p>
            <p style={oStyles.vowQuote}>"{vow}"</p>
          </>
        )}
        {step.type === 'close' && (
          <>
            <p style={oStyles.big}>The spike is already fading.</p>
            <p style={oStyles.sub}>And you're still here. That's the whole victory.</p>
            <div style={oStyles.closeActions} onClick={(e) => e.stopPropagation()}>
              <button style={oStyles.closeBtn} onClick={onClose}>The wave passed</button>
              {onLog && <button style={oStyles.logBtn} onClick={onLog}>Log this moment →</button>}
            </div>
          </>
        )}

        {step.type !== 'close' && (
          <>
            <div style={oStyles.dots}>
              {steps.map((_, d) => <span key={d} style={{ ...oStyles.dot, ...(d === i ? oStyles.dotActive : {}) }} />)}
            </div>
            <p style={oStyles.tapHint}>tap to continue</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function MotivationHome() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [substance, setSubstance] = useState(null)
  const [vow, setVow] = useState(null)
  const [vowDate, setVowDate] = useState(null)
  const [why, setWhy] = useState(null)
  const [costLine, setCostLine] = useState(null)
  const [anchors, setAnchors] = useState([])
  const [daysFree, setDaysFree] = useState(null)
  const [trackerId, setTrackerId] = useState(null)
  const [override, setOverride] = useState(false)
  const [readSlugs, setReadSlugs] = useState([])
  // theme filtering now lives in MotivationLibrary

  useEffect(() => {
    let active = true
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (active) setLoading(false); return }

      const { data: prof } = await supabase.from('profiles').select('bio').eq('id', user.id).maybeSingle()
      if (active && prof?.bio) setWhy(prof.bio)

      const { data: vp } = await supabase.from('vow_path_progress').select('primary_substance').eq('user_id', user.id).maybeSingle()
      if (active && vp?.primary_substance) setSubstance(vp.primary_substance)

      const { data: vowRows } = await supabase.from('free_stage_signals')
        .select('payload, created_at').eq('user_id', user.id).eq('signal_type', 'commit_vow')
        .order('created_at', { ascending: false }).limit(1)
      if (active && vowRows && vowRows[0]?.payload?.text) {
        setVow(vowRows[0].payload.text)
        setVowDate(vowRows[0].created_at)
      }

      const { data: costRows } = await supabase.from('free_stage_signals')
        .select('payload').eq('user_id', user.id).eq('signal_type', 'reflect_cost')
        .order('created_at', { ascending: false }).limit(1)
      const c = costRows && costRows[0]?.payload
      if (active && c?.daily_cost != null && c?.max_horizon) {
        const spend = c.daily_cost * c.max_horizon
        const days = Math.round((c.daily_hours || 0) * c.max_horizon / 24)
        setCostLine(`You mapped it yourself: ${inr(spend)}${days ? ` and ${days} whole days of your life` : ''}. None of it is worth the next ten minutes.`)
      } else {
        const { data: roiRows } = await supabase.from('free_stage_signals')
          .select('payload').eq('user_id', user.id).eq('signal_type', 'notice_roi')
          .order('created_at', { ascending: false }).limit(1)
        const after = roiRows && roiRows[0]?.payload?.after
        if (active && after) setCostLine(`You wrote it down yourself: what's left after is ${after} — never the promise it makes right now.`)
      }

      const { data: anchorRows } = await supabase.from('anchors')
        .select('name, relationship').eq('user_id', user.id).limit(3)
      if (active && anchorRows) setAnchors(anchorRows)

      const { data: readRows } = await supabase.from('free_stage_signals')
        .select('payload').eq('user_id', user.id).eq('signal_type', 'motivation_read')
      if (active && readRows) setReadSlugs(readRows.map(r => r.payload?.slug).filter(Boolean))

      const { data: trk } = await supabase.from('trackers')
        .select('id, start_date').eq('user_id', user.id).eq('is_active', true).order('created_at').limit(1)
      if (active && trk && trk[0]) {
        setTrackerId(trk[0].id)
        setDaysFree(Math.max(0, Math.floor((Date.now() - new Date(trk[0].start_date).getTime()) / 86400000)))
      }

      if (active) setLoading(false)
    }
    load()
    return () => { active = false }
  }, [])

  const todayQuote = getTodayQuote()
  const visibleArticles = ARTICLES.filter(a => a.substance === null || a.substance === substance)
  const vowDateStr = vowDate ? new Date(vowDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null

  const readCount = visibleArticles.filter(a => readSlugs.includes(a.slug)).length

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        <div style={styles.header}>
          <div style={{ width: '40px' }} />
          <span style={styles.brandCenter}><VowBrandMark size={17} /></span>
          <button onClick={() => navigate('/app/profile')} style={styles.profileBtn} aria-label="Profile"><ProfileIcon /></button>
        </div>

        {/* THE NIGHT SKY — the tree, drawn in stars */}
        <NightSky
          lit={readCount}
          total={visibleArticles.length}
          quote={todayQuote.text}
          attribution={todayQuote.attribution}
        />

        {/* YOUR VOW — the illuminated artifact */}
        <div>
          <p style={styles.sectionLabel}>Your vow</p>
          <div style={styles.vowCard}>
            <span style={styles.vowQuoteMark}>&ldquo;</span>
            {vow ? (
              <>
                <p style={styles.vowText}>{vow}</p>
                <p style={styles.vowMeta}>&mdash; sealed {vowDateStr || 'by you'} &middot; don&rsquo;t let tonight erase this</p>
              </>
            ) : why ? (
              <>
                <p style={styles.vowText}>{why}</p>
                <p style={styles.vowMeta}>&mdash; your reason, the one that started this</p>
              </>
            ) : (
              <>
                <p style={styles.vowEmpty}>Your vow will live here.</p>
                <p style={styles.vowMeta}>write it in Getting ready, and it becomes your anchor here</p>
              </>
            )}
          </div>
        </div>

        {/* THE OVERRIDE — break glass */}
        <button style={styles.override} onClick={() => setOverride(true)}>
          <span style={styles.overrideDot} />
          <span style={styles.overrideLabel}>The urge is here</span>
        </button>

        {/* THE SHELF — four weathers, then the whole library */}
        <div>
          <p style={styles.sectionLabel}>The shelf</p>
          <p style={styles.weatherTitle}>What&rsquo;s the weather tonight?</p>
          <div style={styles.catGrid}>
            {THEMES.map(t => {
              const arts = visibleArticles.filter(a => (THEME_MAP[t.key] || []).includes(a.slug))
              const read = arts.filter(a => readSlugs.includes(a.slug)).length
              return (
                <button key={t.key} onClick={() => navigate(`/app/motivation/library/${t.key}`)} style={styles.catTile}>
                  <span style={styles.catLabel}>{t.label}</span>
                  <span style={styles.catMeta}>{arts.length} essays{read ? ` \u00B7 ${read} read` : ''}</span>
                </button>
              )
            })}
          </div>
          <button onClick={() => navigate('/app/motivation/library')} style={styles.allTile}>
            <span style={styles.allLabel}>All essays</span>
            <span style={styles.allMeta}>{visibleArticles.length} on the shelf &middot; {readCount} read &rarr;</span>
          </button>
        </div>

        <VowPathInvite variant="calm" />

        <BottomNav />
      </div>

      {override && (
        <OverrideFlow
          vow={vow}
          costLine={costLine}
          anchors={anchors}
          daysFree={daysFree}
          onClose={() => setOverride(false)}
          onLog={trackerId ? () => navigate(`/app/urge/${trackerId}`) : null}
        />
      )}
    </div>
  )
}

const styles = {
  frame: { minHeight: '100vh', background: 'linear-gradient(180deg, #FDFBF6 0%, #F6EFDD 100%)', padding: '1.25rem 1rem 2rem', display: 'flex', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  phone: { maxWidth: '440px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' },

  header: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brandCenter: { position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', pointerEvents: 'none' },
  profileBtn: { background: 'transparent', border: 'none', color: '#854F0B', cursor: 'pointer', padding: '4px 8px', minWidth: '40px', display: 'flex', justifyContent: 'flex-end' },

  sectionLabel: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.16em', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '4px 2px 9px' },

  vowCard: { position: 'relative', background: '#FBF7EE', border: '0.5px solid #E5D9C2', borderRadius: '16px', padding: '20px 18px 14px', boxShadow: '0 3px 14px rgba(120,90,40,0.07)' },
  vowQuoteMark: { position: 'absolute', top: '4px', left: '11px', fontFamily: 'Georgia, serif', fontSize: '34px', color: '#D9B57A', opacity: 0.55, lineHeight: 1 },
  vowText: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '16px', color: '#2A1F15', lineHeight: 1.6, margin: '4px 0 0', textAlign: 'center' },
  vowEmpty: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '15px', color: '#9C8C78', lineHeight: 1.6, margin: '4px 0 0', textAlign: 'center' },
  vowMeta: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '10.5px', color: '#9C8C78', textAlign: 'right', margin: '10px 0 0' },

  override: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '13px', border: 'none', borderRadius: '999px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', boxShadow: '0 5px 16px -5px rgba(30,18,8,0.45)', cursor: 'pointer', fontFamily: 'Georgia, serif' },
  overrideDot: { width: '7px', height: '7px', borderRadius: '50%', background: '#C5572C', boxShadow: '0 0 8px rgba(197,87,44,0.8)' },
  overrideLabel: { fontSize: '13.5px', color: '#FAF7F1', fontWeight: 500 },

  weatherTitle: { fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0 0 11px' },
  pillRow: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' },
  pill: { padding: '7px 14px', borderRadius: '999px', border: '0.5px solid #DDCFB6', background: '#FDFBF6', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontSize: '12.5px', cursor: 'pointer', transition: 'all 0.15s' },
  pillActive: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#D9B57A', border: '0.5px solid #3A2A1C' },

  catGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' },
  catTile: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '5px', padding: '16px 14px', minHeight: '72px', background: '#FBF7EE', border: '0.5px solid #E5D9C2', borderRadius: '16px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', boxShadow: '0 2px 10px rgba(120,90,40,0.05)' },
  catLabel: { fontSize: '15px', fontWeight: 500, color: '#2A1F15', fontFamily: 'Georgia, serif' },
  catMeta: { fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontVariantNumeric: 'tabular-nums' },
  allTile: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '9px', padding: '13px 16px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', border: '0.5px solid rgba(217,181,122,0.35)', borderRadius: '14px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 5px 16px -6px rgba(30,18,8,0.4)' },
  allLabel: { fontSize: '14px', fontWeight: 500, color: '#FAF7F1', fontFamily: 'Georgia, serif' },
  allMeta: { fontSize: '11px', color: '#D9B57A', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontVariantNumeric: 'tabular-nums' },
}

const oStyles = {
  overlay: { position: 'fixed', inset: 0, zIndex: 1000, background: 'linear-gradient(180deg, #2A1D12 0%, #16100B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.75rem', cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none' },
  inner: { maxWidth: '420px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },

  breatheWrap: { height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' },
  breatheRing: { width: '90px', height: '90px', borderRadius: '50%', border: '1.5px solid rgba(217,181,122,0.55)', boxShadow: '0 0 40px rgba(217,181,122,0.25)', animation: 'vowBreathe 4.5s ease-in-out infinite' },

  eyebrow: { fontSize: '10.5px', color: '#B89456', textTransform: 'uppercase', letterSpacing: '0.22em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 1.25rem' },
  big: { fontSize: '30px', color: '#FAF7F1', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 1rem', lineHeight: 1.25 },
  bigBody: { fontSize: '20px', color: '#F4ECDD', fontFamily: 'Georgia, serif', lineHeight: 1.5, margin: 0, fontStyle: 'italic' },
  sub: { fontSize: '15px', color: '#9C8C78', fontFamily: 'Georgia, serif', lineHeight: 1.6, margin: '1rem 0 0', fontStyle: 'italic' },

  streakNum: { fontSize: '64px', color: '#D9B57A', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1, margin: '0 0 0.5rem', fontVariantNumeric: 'tabular-nums' },

  vowQuote: { fontSize: '24px', color: '#D9B57A', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 500, lineHeight: 1.45, margin: 0 },

  anchorWrap: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginBottom: '0.5rem' },
  anchorChip: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '14px', background: 'rgba(217,181,122,0.08)', border: '0.5px solid rgba(217,181,122,0.25)' },
  anchorIcon: { fontSize: '22px' },
  anchorName: { fontSize: '17px', color: '#FAF7F1', fontFamily: 'Georgia, serif', fontWeight: 500 },
  anchorRel: { fontSize: '12px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginLeft: 'auto' },

  dots: { display: 'flex', gap: '7px', marginTop: '2.5rem', justifyContent: 'center' },
  dot: { width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(217,181,122,0.25)' },
  dotActive: { background: '#D9B57A' },
  tapHint: { fontSize: '11px', color: '#6B5C4A', textTransform: 'uppercase', letterSpacing: '0.2em', fontFamily: 'Georgia, serif', margin: '1rem 0 0' },

  closeActions: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '2.5rem', width: '100%', cursor: 'default' },
  closeBtn: { padding: '16px', borderRadius: '14px', border: 'none', background: 'linear-gradient(180deg, #D9B57A 0%, #B89456 100%)', color: '#241710', fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 600, cursor: 'pointer' },
  logBtn: { padding: '12px', borderRadius: '14px', border: '0.5px solid rgba(217,181,122,0.3)', background: 'transparent', color: '#B89456', fontFamily: 'Georgia, serif', fontSize: '14px', cursor: 'pointer' },
}