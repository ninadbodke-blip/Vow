import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const REACTIONS = [
  { text: 'Stay strong', emoji: '💪' },
  { text: 'Proud of you', emoji: '🌟' },
  { text: 'Here for you', emoji: '🤝' },
]

export default function AnchorPublic() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sentReactions, setSentReactions] = useState([])
  const [sending, setSending] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const { data: result, error: fnError } = await supabase
          .rpc('get_public_anchor_view', { token })
        
        if (fnError) throw fnError
        
        if (!result || result.length === 0) {
          setError('This link is no longer valid.')
        } else {
          setData(result[0])
        }
      } catch (err) {
        setError('Something went wrong. Please ask for a new link.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const sendReaction = async (reactionText) => {
    setSending(reactionText)
    try {
      // Goes through the submit_anchor_reaction SECURITY DEFINER RPC so the
      // anonymous role doesn't need direct SELECT/INSERT on anchors or
      // anchor_reactions. The function validates the token and writes the
      // row with the anchor owner's user_id.
      const { error: rpcError } = await supabase
        .rpc('submit_anchor_reaction', {
          p_token: token,
          p_reaction_text: reactionText,
        })

      if (rpcError) throw rpcError

      setSentReactions([...sentReactions, reactionText])
    } catch (err) {
      console.error('submit_anchor_reaction failed:', err)
      alert('Could not send. Please try again.')
    } finally {
      setSending(null)
    }
  }

  if (loading) {
    return (
      <div style={styles.frame}>
        <div style={styles.card}>
          <p style={styles.loading}>Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.frame}>
        <div style={styles.card}>
          <div style={styles.icon}>🔒</div>
          <h1 style={styles.title}>Link unavailable</h1>
          <p style={styles.subtitle}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.frame}>
      <div style={styles.card}>

        {/* Vow brand strip */}
        <div style={styles.brand}>
          <p style={styles.logo}>Vow</p>
          <p style={styles.tag}>Keep the vow.</p>
        </div>

        <div style={styles.divider}></div>

        {/* Hero */}
        <div style={styles.hero}>
          <div style={styles.icon}>⚓</div>
          <p style={styles.heroLabel}>You're an anchor for</p>
          <h1 style={styles.heroName}>{data.user_first_name}</h1>
        </div>

        {/* Streak card */}
        <div style={styles.streakCard}>
          <p style={styles.streakNum}>{data.current_streak_days}</p>
          <p style={styles.streakUnit}>days clean</p>
          <p style={styles.streakSub}>
            {data.user_first_name} is staying strong with their {data.longest_addiction_name?.toLowerCase()} journey.
          </p>
        </div>

        {/* Supportive line */}
        <p style={styles.supportLine}>
          Even small moments of encouragement matter.<br/>
          Send one when you can.
        </p>

        {/* Reactions */}
        <div style={styles.reactionsWrap}>
          {REACTIONS.map(r => {
            const isSent = sentReactions.includes(r.text)
            const isSending = sending === r.text
            return (
              <button
                key={r.text}
                onClick={() => sendReaction(r.text)}
                disabled={isSent || isSending}
                style={{
                  ...styles.reactionBtn,
                  ...(isSent ? styles.reactionBtnSent : {}),
                }}
              >
                <span style={styles.reactionEmoji}>{r.emoji}</span>
                <span>
                  {isSending ? 'Sending...' : isSent ? `Sent · ${r.text}` : r.text}
                </span>
                {isSent && <span style={styles.reactionCheck}>✓</span>}
              </button>
            )
          })}
        </div>

        {sentReactions.length > 0 && (
          <p style={styles.thanksNote}>
            💛 Thank you. {data.user_first_name} will see your message.
          </p>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerLine}>
            This page shows nothing else about {data.user_first_name}.
          </p>
          <p style={styles.footerLine}>
            Their privacy stays with them.
          </p>
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
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    background: '#FAF7F1',
    maxWidth: '440px', width: '100%',
    borderRadius: '28px',
    padding: '2.5rem 2rem 2rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },
  loading: {
    textAlign: 'center', color: '#9C8C78',
    padding: '3rem 0', fontFamily: 'Georgia, serif',
  },

  brand: {
    textAlign: 'center', marginBottom: '0.75rem',
  },
  logo: {
    fontSize: '24px', fontWeight: 500, color: '#2A1F15',
    margin: 0, letterSpacing: '-0.02em',
    fontFamily: 'Georgia, serif',
  },
  tag: {
    fontSize: '11px', color: '#8A7B6A', fontStyle: 'italic',
    margin: '4px 0 0', fontFamily: 'Georgia, serif',
  },
  divider: {
    height: '0.5px', background: '#E8DFD0',
    margin: '1.25rem 0',
  },

  hero: { textAlign: 'center', marginBottom: '1.5rem' },
  icon: { fontSize: '40px', marginBottom: '0.5rem' },
  heroLabel: {
    fontSize: '13px', color: '#9C8C78',
    fontStyle: 'italic',
    margin: '0 0 0.25rem',
    fontFamily: 'Georgia, serif',
  },
  heroName: {
    fontSize: '28px', fontWeight: 500, color: '#2A1F15',
    margin: 0, fontFamily: 'Georgia, serif',
    letterSpacing: '-0.01em',
  },

  streakCard: {
    background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)',
    border: '0.5px solid #E8DCC2',
    borderRadius: '18px',
    padding: '1.75rem 1.25rem',
    textAlign: 'center',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 14px rgba(120,80,30,0.08)',
  },
  streakNum: {
    fontSize: '64px', fontWeight: 500, color: '#C5572C',
    margin: 0, lineHeight: 1,
    fontFamily: 'Georgia, serif',
    fontVariantNumeric: 'tabular-nums',
  },
  streakUnit: {
    fontSize: '11px', textTransform: 'uppercase',
    letterSpacing: '0.12em', color: '#854F0B',
    margin: '8px 0 12px', fontWeight: 500,
  },
  streakSub: {
    fontSize: '13px', color: '#2A1F15',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: 0, lineHeight: 1.5,
  },

  supportLine: {
    fontSize: '13px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    textAlign: 'center', lineHeight: 1.6,
    margin: '0 0 1rem',
  },

  reactionsWrap: {
    display: 'flex', flexDirection: 'column', gap: '8px',
    marginBottom: '1rem',
  },
  reactionBtn: {
    display: 'flex', alignItems: 'center',
    width: '100%', padding: '14px 16px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    fontSize: '14px', color: '#2A1F15',
    fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
    textAlign: 'left',
    gap: '12px',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  reactionBtnSent: {
    background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)',
    border: '0.5px solid #7A8C5A',
    color: '#3B6D11',
    cursor: 'default',
    boxShadow: 'none',
  },
  reactionEmoji: { fontSize: '20px' },
  reactionCheck: {
    marginLeft: 'auto',
    color: '#7A8C5A',
    fontWeight: 700,
  },

  thanksNote: {
    fontSize: '13px', color: '#3B6D11',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '0 0 1rem',
    padding: '10px',
    background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)',
    borderRadius: '12px',
    border: '0.5px solid #C2D49A',
  },

  footer: {
    textAlign: 'center',
    padding: '1rem 0 0',
    borderTop: '0.5px solid #E8DFD0',
    marginTop: '1rem',
  },
  footerLine: {
    fontSize: '11px', color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '2px 0',
  },

  title: {
    fontSize: '24px', fontWeight: 500, color: '#2A1F15',
    margin: '0 0 0.5rem',
    fontFamily: 'Georgia, serif',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '14px', color: '#6B5C4A',
    textAlign: 'center', lineHeight: 1.6,
    margin: 0, fontFamily: 'Georgia, serif',
  },
}