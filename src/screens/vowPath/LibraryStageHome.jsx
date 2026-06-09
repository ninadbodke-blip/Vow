import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { REFLECT_DEEP_READS } from './data/reflectDeepReads'
import { NOTICE_DEEP_READS } from './data/noticeDeepReads'
import { COMMIT_DEEP_READS } from './data/commitDeepReads'
import { ENDURE_DEEP_READS } from './data/endureDeepReads'
import { BUILD_DEEP_READS } from './data/buildDeepReads'

const STAGE_CONFIG = {
  notice: {
    label: 'Notice',
    eyebrow: 'Precontemplation',
    title: 'The science of pattern awareness.',
    subtitle: 'Why looking honestly at your own lines, trajectory, and ledger is the work — not the diagnosis.',
    data: NOTICE_DEEP_READS,
    totalDays: 5,
    groups: null,
  },
  reflect: {
    label: 'Reflect',
    eyebrow: 'Contemplation',
    title: 'Twenty-one chapters of looking.',
    subtitle: 'The companion essays to the Mirror, the Weighing, and the Deciding.',
    data: REFLECT_DEEP_READS,
    totalDays: 21,
    groups: [
      { title: 'Week 1 — See it', subtitle: 'Days 1–7. Honest looking.', range: [1, 7] },
      { title: 'Week 2 — Feel it', subtitle: 'Days 8–14. Both sides of the trade.', range: [8, 14] },
      { title: 'Week 3 — Decide', subtitle: 'Days 15–21. Where do you actually stand?', range: [15, 21] },
    ],
  },
  commit: {
    label: 'Commit',
    eyebrow: 'Preparation',
    title: 'The infrastructure of a vow.',
    subtitle: 'Why a written, dated, witnessed commitment holds where private intention does not.',
    data: COMMIT_DEEP_READS,
    totalDays: 10,
    groups: null,
  },
  endure: {
    label: 'Endure',
    eyebrow: 'Action',
    title: 'Twenty-one days of holding.',
    subtitle: 'The crash, the flatness, the return — named, mapped, and walked.',
    data: ENDURE_DEEP_READS,
    totalDays: 21,
    groups: [
      { title: 'Phase 1 — Crash', subtitle: 'Days 1–7. The acute stretch.', range: [1, 7] },
      { title: 'Phase 2 — Flatness', subtitle: 'Days 8–14. The middle, where most people leave.', range: [8, 14] },
      { title: 'Phase 3 — Return', subtitle: 'Days 15–21. Pleasure flickering back. The vow held.', range: [15, 21] },
    ],
  },
  build: {
    label: 'Build',
    eyebrow: 'Maintenance',
    title: 'Nine weeks of building a life.',
    subtitle: 'The maintenance-stage essays — the flat after, the new tenant, the quiet self, the long horizon, the return path, the floor.',
    data: BUILD_DEEP_READS,
    totalDays: 9,
    groups: [
      { title: 'Arriving', subtitle: 'Weeks 1–3. Settling into the quiet.', range: [1, 3] },
      { title: 'Constructing', subtitle: 'Weeks 4–6. Who you are when no one is watching.', range: [4, 6] },
      { title: 'Horizon', subtitle: 'Weeks 7–9. The longer view.', range: [7, 9] },
    ],
  },
}

export default function LibraryStageHome() {
  const navigate = useNavigate()
  const { stage } = useParams()
  const config = STAGE_CONFIG[stage]

  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/app/welcome')
        return
      }

      const { data: progressRow } = await supabase
        .from('vow_path_progress')
        .select('current_stage, last_completed_day, is_pilot_mode, completed_stages')
        .eq('user_id', user.id)
        .maybeSingle()

      setProgress(progressRow)
      setLoading(false)
    }
    load()
  }, [navigate])

  if (!config) {
    return (
      <div style={styles.frame}>
        <div style={styles.phone}>
          <div style={styles.topBar}>
            <button onClick={() => navigate('/app/home')} style={styles.backBtn}>‹ Home</button>
            <p style={styles.topBarTitle}>Unknown</p>
            <div style={{ width: '60px' }}></div>
          </div>
          <div style={styles.errorBlock}>
            <p style={styles.errorTitle}>Unknown stage</p>
            <p style={styles.errorText}>
              We don't have a library for "{stage}" yet.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={styles.frame}>
        <div style={styles.loadingPhone}>Loading...</div>
      </div>
    )
  }

  const isUnlocked = (dayNumber) => {
    if (import.meta.env.DEV) return true
    if (!progress) return false
    if (progress.is_pilot_mode) return true

    const completed = progress.completed_stages || []
    if (completed.some(c => c.stage === stage)) return true
    if (progress.current_stage === stage) {
      return dayNumber <= (progress.last_completed_day || 0)
    }
    return false
  }

  const unlockedCount = (() => {
    if (!progress) return 0
    if (import.meta.env.DEV || progress.is_pilot_mode) return config.totalDays
    const completed = progress.completed_stages || []
    if (completed.some(c => c.stage === stage)) return config.totalDays
    if (progress.current_stage === stage) return progress.last_completed_day || 0
    return 0
  })()

  const dayList = []
  for (let d = 1; d <= config.totalDays; d++) {
    const dr = config.data[d]
    if (dr) dayList.push(dr)
  }

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        <div style={styles.topBar}>
          <button onClick={() => navigate(`/app/vow-path/${stage}`)} style={styles.backBtn}>‹ Back</button>
          <p style={styles.topBarTitle}>{config.label}</p>
          <div style={{ width: '60px' }}></div>
        </div>

        {/* HERO */}
        <div style={styles.hero}>
          <p style={styles.eyebrow}>{config.eyebrow}</p>
          <h1 style={styles.title}>{config.title}</h1>
          <p style={styles.subtitle}>{config.subtitle}</p>
          <div style={styles.heroDivider}></div>
          <p style={styles.progressNote}>
            You have unlocked <span style={styles.progressEmph}>{unlockedCount}</span> of {config.totalDays} manuscripts.
          </p>
          <div style={styles.tallyMarks}>
            {Array.from({ length: config.totalDays }).map((_, i) => {
              const n = i + 1
              const done = isUnlocked(n)
              const next = !done && isUnlocked(n - 1)
              return (
                <span key={i} style={{
                  ...styles.tallyMark,
                  color: done ? '#D9B57A' : next ? '#854F0B' : '#C9BBA3',
                  opacity: done || next ? 1 : 0.7,
                }}>{done ? '✦' : next ? '✧' : '·'}</span>
              )
            })}
          </div>
        </div>

        {/* CHAPTERS — grouped or flat */}
        {config.groups ? (
          config.groups.map(group => {
            const [start, end] = group.range
            const groupDays = dayList.filter(dr => dr.day >= start && dr.day <= end)
            return (
              <div key={group.title} style={styles.groupSection}>
                <div style={styles.groupHeader}>
                  <div style={styles.groupOrnament}>✧ · ✦ · ✧</div>
                  <p style={styles.groupTitle}>{group.title}</p>
                  <p style={styles.groupSubtitle}>{group.subtitle}</p>
                </div>
                <div style={styles.dayList}>
                  <div style={styles.thread} />
                  {groupDays.map(dr => (
                    <DayRow
                      key={dr.day}
                      dr={dr}
                      stage={stage}
                      unlocked={isUnlocked(dr.day)}
                      navigate={navigate}
                    />
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          <div style={styles.flatSection}>
            <div style={styles.dayList}>
              <div style={styles.thread} />
              {dayList.map(dr => (
                <DayRow
                  key={dr.day}
                  dr={dr}
                  stage={stage}
                  unlocked={isUnlocked(dr.day)}
                  navigate={navigate}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function DayRow({ dr, stage, unlocked, navigate }) {
  return (
    <button
      onClick={() => unlocked ? navigate(`/app/library/${stage}/day/${dr.day}`) : null}
      disabled={!unlocked}
      style={{
        ...styles.tocRow,
        ...(unlocked ? {} : styles.tocRowLocked),
        cursor: unlocked ? 'pointer' : 'default',
      }}
    >
      <span style={{ ...styles.tocNode, color: unlocked ? '#D9B57A' : '#C9BBA3' }}>
        {unlocked ? '✦' : '·'}
      </span>
      <span style={styles.tocBody}>
        <span style={styles.tocTitleRow}>
          <span style={styles.tocTitle}>{dr.title}</span>
          <span style={styles.tocLeader} />
          <span style={unlocked ? styles.tocMinutes : styles.tocAwaiting}>
            {unlocked ? `${dr.readMinutes} min` : 'Awaiting'}
          </span>
        </span>
        <span style={styles.tocSubtitle}>{dr.subtitle}</span>
      </span>
    </button>
  )
}

const styles = {
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
    maxWidth: '460px',
    width: '100%',
    borderRadius: '28px',
    padding: '1.5rem 1.5rem 2.5rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },
  loadingPhone: {
    background: '#FAF7F1',
    maxWidth: '460px',
    width: '100%',
    borderRadius: '28px',
    padding: '5rem 2rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10)',
    color: '#9C8C78',
    textAlign: 'center',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  topBarTitle: {
    fontSize: '13px', fontWeight: 500, color: '#9C8C78',
    margin: 0, fontFamily: 'Georgia, serif', fontStyle: 'italic',
    textAlign: 'center', flex: 1,
  },
  backBtn: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '14px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px',
    minWidth: '60px', textAlign: 'left',
  },

  hero: {
    textAlign: 'center',
    padding: '1.25rem 0 1.5rem',
    marginBottom: '1.5rem',
  },
  eyebrow: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 1rem',
  },
  title: {
    fontSize: '28px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.25,
    margin: '0 0 0.85rem',
    letterSpacing: '-0.01em',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.65,
    margin: '0 auto 1.25rem',
    maxWidth: '340px',
  },
  heroDivider: {
    height: '0.5px',
    background: '#E8DFD0',
    width: '40%',
    margin: '0 auto 1rem',
  },
  progressNote: {
    fontSize: '12px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
  },

  groupSection: {
    marginBottom: '2rem',
  },
  flatSection: {
    marginBottom: '2rem',
  },
  groupHeader: {
    textAlign: 'center',
    marginBottom: '1.25rem',
    marginTop: '0.5rem',
  },
  groupTitle: {
    fontSize: '12px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.22em',
    margin: '0 0 4px',
  },
  groupSubtitle: {
    fontSize: '12px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
    lineHeight: 1.5,
  },
  dayList: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  dayRow: {
    display: 'flex', alignItems: 'center',
    width: '100%',
    padding: '14px 14px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    gap: '12px',
    transition: 'all 0.15s',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  dayRowLocked: {
    background: '#F0EBDF',
    borderColor: '#E0D8C5',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  dayNum: {
    width: '34px', height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E0D5C2',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  dayNumText: {
    fontSize: '12px', fontWeight: 500,
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontVariantNumeric: 'tabular-nums',
  },
  dayNumTextLocked: {
    color: '#B5A990',
  },
  dayContent: {
    flex: 1,
    minWidth: 0,
  },
  dayTitle: {
    fontSize: '14.5px', fontWeight: 500,
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: 0,
    lineHeight: 1.35,
  },
  dayTitleLocked: {
    color: '#9C8C78',
  },
  daySubtitle: {
    fontSize: '12px', color: '#9C8C78',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif',
    margin: '3px 0 0',
    lineHeight: 1.45,
  },
  daySubtitleLocked: {
    color: '#B5A990',
  },
  dayMeta: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dayMinutes: {
    fontSize: '11px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    fontVariantNumeric: 'tabular-nums',
  },
  dayArrow: {
    fontSize: '18px',
    color: '#854F0B',
    fontWeight: 500,
  },
  dayLockIcon: {
    fontSize: '13px',
    opacity: 0.5,
  },

  progressEmph: { color: '#854F0B', fontVariantNumeric: 'tabular-nums', fontStyle: 'normal', fontWeight: 500 },
  tallyMarks: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '7px', margin: '0.9rem auto 0', maxWidth: '320px' },
  tallyMark: { fontSize: '14px', lineHeight: 1 },
  groupOrnament: { fontSize: '12px', color: '#D9B57A', letterSpacing: '0.4em', marginBottom: '0.6rem' },
  thread: { position: 'absolute', left: '15px', top: '14px', bottom: '14px', width: '1.5px', background: '#D9B57A', opacity: 0.4, zIndex: 0 },
  tocRow: { position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%', background: 'transparent', border: 'none', textAlign: 'left', padding: '11px 4px', fontFamily: 'inherit' },
  tocRowLocked: { opacity: 0.3 },
  tocNode: { width: '28px', flexShrink: 0, textAlign: 'center', fontSize: '14px', lineHeight: '1.5', background: '#FAF7F1' },
  tocBody: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px', paddingTop: '1px' },
  tocTitleRow: { display: 'flex', alignItems: 'baseline', gap: 0 },
  tocTitle: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.3 },
  tocLeader: { flex: 1, borderBottom: '1px dotted #CDB791', margin: '0 8px 5px', minWidth: '14px' },
  tocMinutes: { fontSize: '11px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontVariantNumeric: 'tabular-nums', flexShrink: 0 },
  tocAwaiting: { fontSize: '10px', color: '#9C8C78', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 500, flexShrink: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  tocSubtitle: { fontSize: '12px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.45 },
  errorBlock: { textAlign: 'center', padding: '3rem 1rem' },
  errorTitle: {
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 0.75rem',
  },
  errorText: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: 0,
  },
}