import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLang } from '../LanguageContext'
import { supabase } from '../supabaseClient'

export default function Milestones() {
  const { trackerId } = useParams()
  const navigate = useNavigate()
  const { t } = useLang()

  const [tracker, setTracker] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [earned, setEarned] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data: t } = await supabase
          .from('trackers')
          .select('*, addiction_types(name, icon)')
          .eq('id', trackerId)
          .single()
        if (!t) { navigate('/home'); return }
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
        <div style={{...styles.phone, textAlign: 'center', color: '#9C8C78', paddingTop: '4rem'}}>
          Loading milestones...
        </div>
      </div>
    )
  }

  const start = new Date(tracker.start_date)
  const now = new Date()
  const currentDays = Math.floor((now - start) / (1000 * 60 * 60 * 24))
  const earnedIds = new Set(earned.map(e => e.milestone_id))
  const earnedCount = milestones.filter(m => earnedIds.has(m.id)).length

  // Find next milestone (smallest days_required > currentDays)
  const nextMilestone = milestones.find(m => m.days_required > currentDays)
  const daysToNext = nextMilestone ? nextMilestone.days_required - currentDays : null

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        <div style={styles.header}>
          <button onClick={() => navigate('/home')} style={styles.backBtn}>‹ Back</button>
          <p style={styles.headerTitle}>Milestones</p>
          <div style={{width: '40px'}}></div>
        </div>

        <div style={styles.summaryCard}>
          <p style={styles.summaryIcon}>{tracker.addiction_types.icon}</p>
          <p style={styles.summaryName}>{tracker.addiction_types.name}</p>
          <p style={styles.summaryStreak}>Day {currentDays}</p>
          <p style={styles.summaryEarned}>
            <b>{earnedCount}</b> of {milestones.length} milestones earned
          </p>
          {nextMilestone && (
            <div style={styles.nextBox}>
              <p style={styles.nextLabel}>Next milestone</p>
              <p style={styles.nextValue}>
                {nextMilestone.badge_icon} {nextMilestone.label}
              </p>
              <p style={styles.nextSub}>
                {daysToNext === 1 ? '1 day to go' : `${daysToNext} days to go`}
              </p>
            </div>
          )}
        </div>

        <div style={styles.gridSection}>
          <p style={styles.sectionLabel}>All milestones</p>
          <div style={styles.grid}>
            {milestones.map(m => {
              const isEarned = earnedIds.has(m.id)
              const isNext = nextMilestone?.id === m.id
              return (
                <div
                  key={m.id}
                  style={{
                    ...styles.tile,
                    ...(isEarned ? styles.tileEarned : styles.tileLocked),
                    ...(isNext ? styles.tileNext : {}),
                  }}
                >
                  <p style={{
                    ...styles.tileIcon,
                    ...(isEarned ? {} : styles.tileIconLocked),
                  }}>
                    {m.badge_icon}
                  </p>
                  <p style={{
                    ...styles.tileLabel,
                    ...(isEarned ? {} : styles.tileLabelLocked),
                  }}>
                    {m.label}
                  </p>
                  <p style={{
                    ...styles.tileDays,
                    ...(isEarned ? styles.tileDaysEarned : {}),
                  }}>
                    {isEarned ? '✓ Earned' : `Day ${m.days_required}`}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
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
    maxWidth: '440px',
    width: '100%',
    borderRadius: '28px',
    padding: '1.5rem 1.25rem 2rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '1.25rem',
  },
  backBtn: {
    background: 'transparent', border: 'none',
    color: '#854F0B', fontSize: '14px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px',
  },
  headerTitle: {
    fontSize: '17px', fontWeight: 500, color: '#2A1F15',
    margin: 0, fontFamily: 'Georgia, serif',
  },
  summaryCard: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '20px',
    padding: '1.5rem 1.25rem',
    textAlign: 'center',
    boxShadow: '0 4px 16px rgba(80,50,20,0.06)',
    marginBottom: '1.5rem',
  },
  summaryIcon: { fontSize: '32px', margin: '0 0 4px' },
  summaryName: {
    fontSize: '13px', color: '#6B5C4A', margin: '0 0 8px',
    fontFamily: 'Georgia, serif',
  },
  summaryStreak: {
    fontSize: '36px', fontWeight: 500, color: '#2A1F15',
    margin: '0 0 4px', fontFamily: 'Georgia, serif', lineHeight: 1,
  },
  summaryEarned: {
    fontSize: '13px', color: '#6B5C4A',
    margin: '4px 0 1.25rem', fontFamily: 'Georgia, serif',
  },
  nextBox: {
    background: 'linear-gradient(180deg, #F4ECDD 0%, #F0E5D0 100%)',
    border: '0.5px solid #E8DCC2',
    borderRadius: '12px',
    padding: '12px',
  },
  nextLabel: {
    fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
    color: '#8A7B6A', margin: '0 0 4px', fontWeight: 500,
  },
  nextValue: {
    fontSize: '17px', fontWeight: 500, color: '#2A1F15',
    margin: 0, fontFamily: 'Georgia, serif',
  },
  nextSub: {
    fontSize: '12px', color: '#854F0B', margin: '4px 0 0',
    fontWeight: 500,
  },
  gridSection: { marginTop: '1rem' },
  sectionLabel: {
    fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
    color: '#9C8C78', margin: '0 0 12px', fontWeight: 500,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  tile: {
    borderRadius: '12px',
    padding: '14px 6px',
    textAlign: 'center',
    border: '0.5px solid #E8DFD0',
  },
  tileEarned: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    boxShadow: '0 2px 6px rgba(80,50,20,0.06)',
  },
  tileLocked: {
    background: '#F0EBDF',
    border: '0.5px solid #E0D8C5',
  },
  tileNext: {
    border: '1.5px solid #C5572C',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    boxShadow: '0 4px 12px rgba(197,87,44,0.15)',
  },
  tileIcon: { fontSize: '24px', margin: '0 0 4px' },
  tileIconLocked: { filter: 'grayscale(100%) opacity(0.4)' },
  tileLabel: {
    fontSize: '11px', fontWeight: 500, color: '#2A1F15',
    margin: '0 0 4px', lineHeight: 1.3,
  },
  tileLabelLocked: { color: '#9C8C78' },
  tileDays: {
    fontSize: '9px', color: '#9C8C78',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    margin: 0,
  },
  tileDaysEarned: {
    color: '#7A8C5A', fontWeight: 500,
  },
}