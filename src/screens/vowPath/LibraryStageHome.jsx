import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { REFLECT_DEEP_READS } from './data/reflectDeepReads'
import { NOTICE_DEEP_READS } from './data/noticeDeepReads'
import { COMMIT_DEEP_READS } from './data/commitDeepReads'
import { ENDURE_DEEP_READS } from './data/endureDeepReads'

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
        navigate('/welcome')
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
            <button onClick={() => navigate('/home')} style={styles.backBtn}>‹ Home</button>
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
          <button onClick={() => navigate(`/vow-path/${stage}`)} style={styles.backBtn}>‹ Back</button>
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
            <strong style={{ color: '#854F0B', fontVariantNumeric: 'tabular-nums' }}>
              {unlockedCount}
            </strong>
            {' '}of {config.totalDays} chapters unlocked
          </p>
        </div>

        {/* CHAPTERS — grouped or flat */}
        {config.groups ? (
          config.groups.map(group => {
            const [start, end] = group.range
            const groupDays = dayList.filter(dr => dr.day >= start && dr.day <= end)
            return (
              <div key={group.title} style={styles.groupSection}>
                <div style={styles.groupHeader}>
                  <p style={styles.groupTitle}>{group.title}</p>
                  <p style={styles.groupSubtitle}>{group.subtitle}</p>
                </div>
                <div style={styles.dayList}>
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
      onClick={() => unlocked ? navigate(`/library/${stage}/day/${dr.day}`) : null}
      disabled={!unlocked}
      style={{
        ...styles.dayRow,
        ...(unlocked ? {} : styles.dayRowLocked),
      }}
    >
      <div style={styles.dayNum}>
        <span style={{
          ...styles.dayNumText,
          ...(unlocked ? {} : styles.dayNumTextLocked),
        }}>
          {String(dr.day).padStart(2, '0')}
        </span>
      </div>

      <div style={styles.dayContent}>
        <p style={{
          ...styles.dayTitle,
          ...(unlocked ? {} : styles.dayTitleLocked),
        }}>
          {dr.title}
        </p>
        <p style={{
          ...styles.daySubtitle,
          ...(unlocked ? {} : styles.daySubtitleLocked),
        }}>
          {dr.subtitle}
        </p>
      </div>

      <div style={styles.dayMeta}>
        {unlocked ? (
          <>
            <span style={styles.dayMinutes}>{dr.readMinutes} min</span>
            <span style={styles.dayArrow}>›</span>
          </>
        ) : (
          <span style={styles.dayLockIcon}>🔒</span>
        )}
      </div>
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
    marginBottom: '0.85rem',
    paddingLeft: '4px',
  },
  groupTitle: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
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
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
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