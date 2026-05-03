import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function SlipHistory() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const trackerId = searchParams.get('tracker')

  const [tracker, setTracker] = useState(null)
  const [slips, setSlips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/signup'); return }

      if (trackerId) {
        const { data: t } = await supabase
          .from('trackers')
          .select('*, addiction_types(name, icon)')
          .eq('id', trackerId)
          .single()
        setTracker(t)
      }

      const query = supabase
        .from('streak_history')
        .select('*, trackers(addiction_types(name, icon))')
        .eq('user_id', user.id)
        .order('ended_at', { ascending: false })

      if (trackerId) query.eq('tracker_id', trackerId)

      const { data } = await query
      setSlips(data || [])
      setLoading(false)
    }
    load()
  }, [trackerId])

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const formatRelative = (dateStr) => {
    const days = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 30) return `${days}d ago`
    if (days < 365) return `${Math.floor(days/30)}mo ago`
    return `${Math.floor(days/365)}y ago`
  }

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>
        <div style={styles.header}>
          <button onClick={() => navigate('/profile')} style={styles.backBtn}>‹ Back</button>
          <p style={styles.headerTitle}>Slip history</p>
          <div style={{width: '40px'}}></div>
        </div>

        {tracker && (
          <div style={styles.contextCard}>
            <span style={styles.contextIcon}>{tracker.addiction_types.icon}</span>
            <span style={styles.contextName}>{tracker.addiction_types.name}</span>
          </div>
        )}

        {loading ? (
          <p style={styles.empty}>Loading...</p>
        ) : slips.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🌱</div>
            <p style={styles.emptyTitle}>No slips yet.</p>
            <p style={styles.emptyBody}>
              Every day clean is a victory.<br/>
              Keep going.
            </p>
          </div>
        ) : (
          <div style={styles.list}>
            <p style={styles.summary}>
              {slips.length} slip{slips.length > 1 ? 's' : ''} recorded
            </p>
            {slips.map(slip => (
              <div key={slip.id} style={styles.card}>
                <div style={styles.cardHead}>
                  {!tracker && (
                    <span style={styles.cardIcon}>{slip.trackers?.addiction_types?.icon}</span>
                  )}
                  <div style={{flex: 1}}>
                    {!tracker && (
                      <p style={styles.cardName}>{slip.trackers?.addiction_types?.name}</p>
                    )}
                    <p style={styles.cardMeta}>
                      Streak lasted {Math.floor(slip.duration_seconds / 86400)} days
                    </p>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <p style={styles.cardDate}>{formatDate(slip.ended_at)}</p>
                    <p style={styles.cardRelative}>{formatRelative(slip.ended_at)}</p>
                  </div>
                </div>
                {slip.reset_note && (
                  <p style={styles.cardNote}>"{slip.reset_note}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  frame: { minHeight: '100vh', background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)', padding: '2rem 1rem', display: 'flex', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  phone: { background: '#FAF7F1', maxWidth: '440px', width: '100%', borderRadius: '28px', padding: '1.5rem 1.25rem 2rem', boxShadow: '0 14px 40px rgba(60,40,20,0.10)' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' },
  backBtn: { background: 'transparent', border: 'none', color: '#854F0B', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px' },
  headerTitle: { fontSize: '17px', fontWeight: 500, color: '#2A1F15', margin: 0, fontFamily: 'Georgia, serif' },
  contextCard: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'white', border: '0.5px solid #E8DFD0', borderRadius: '999px', marginBottom: '1.25rem', alignSelf: 'flex-start', width: 'fit-content' },
  contextIcon: { fontSize: '16px' },
  contextName: { fontSize: '13px', fontWeight: 500, color: '#2A1F15' },
  summary: { fontSize: '11px', color: '#9C8C78', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  card: { background: 'white', border: '0.5px solid #E8DFD0', borderRadius: '12px', padding: '12px 14px' },
  cardHead: { display: 'flex', alignItems: 'flex-start', gap: '10px' },
  cardIcon: { fontSize: '18px', flexShrink: 0 },
  cardName: { fontSize: '13px', fontWeight: 500, color: '#2A1F15', margin: 0 },
  cardMeta: { fontSize: '12px', color: '#6B5C4A', margin: '2px 0 0' },
  cardDate: { fontSize: '11px', color: '#2A1F15', margin: 0, fontWeight: 500 },
  cardRelative: { fontSize: '10px', color: '#9C8C78', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.04em' },
  cardNote: { fontSize: '13px', color: '#2A1F15', fontStyle: 'italic', margin: '8px 0 0', fontFamily: 'Georgia, serif', lineHeight: 1.5, paddingTop: '8px', borderTop: '0.5px solid #EFE7D7' },
  empty: { textAlign: 'center', color: '#9C8C78', padding: '3rem 0' },
  emptyState: { textAlign: 'center', padding: '3rem 0' },
  emptyIcon: { fontSize: '48px', marginBottom: '1rem' },
  emptyTitle: { fontSize: '17px', fontWeight: 500, color: '#2A1F15', margin: '0 0 0.5rem', fontFamily: 'Georgia, serif' },
  emptyBody: { fontSize: '13px', color: '#6B5C4A', margin: 0, fontFamily: 'Georgia, serif', lineHeight: 1.6 },
}