import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

// Custom SVG glyphs — replaces emoji to match Vow's refined, literary register.
const AnchorGlyph = ({ size = 38, color = '#854F0B' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2.2" />
    <path d="M12 7.2V21" />
    <path d="M8 11h8" />
    <path d="M5 13.5c0 4 3 6.5 7 6.5s7-2.5 7-6.5" />
    <path d="M5 13.5L3.2 12M19 13.5l1.8-1.5" />
  </svg>
)

const StrengthGlyph = ({ size = 18, color = '#854F0B' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 11V7a2 2 0 0 1 4 0v3M10 10V5.5a2 2 0 0 1 4 0V10M14 10.5V8a2 2 0 0 1 4 0v6a6 6 0 0 1-6 6h-1.5a5 5 0 0 1-3.6-1.5L4 14.5a1.7 1.7 0 0 1 2.5-2.2L8 14" />
  </svg>
)
const StarGlyph = ({ size = 18, color = '#854F0B' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3.5l2.4 5.2 5.6.6-4.2 3.8 1.2 5.6L12 21.6l-5 2.7 1.2-5.6L4 14.9l5.6-.6L12 3.5z" />
  </svg>
)
const HandsGlyph = ({ size = 18, color = '#854F0B' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-7-4.2-9-9c-1.2-3 .4-6 3-6 1.8 0 3 1.2 3 1.2" />
    <path d="M12 21s7-4.2 9-9c1.2-3-.4-6-3-6-1.8 0-3 1.2-3 1.2" />
    <path d="M12 7.4V12" />
  </svg>
)

const REACTIONS = [
  { text: 'Stay strong', Glyph: StrengthGlyph },
  { text: 'Proud of you', Glyph: StarGlyph },
  { text: 'Here for you', Glyph: HandsGlyph },
]

const LockGlyph = ({ size = 30, color = '#9C8C78' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
)

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
          <p style={styles.loading}>Loading…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.frame}>
        <div style={styles.card}>
          <div style={styles.glyphWrap}><LockGlyph /></div>
          <h1 style={styles.title}>Link unavailable</h1>
          <p style={styles.subtitle}>{error}</p>
        </div>
      </div>
    )
  }

  const allSent = sentReactions.length >= REACTIONS.length

  return (
    <div style={styles.frame}>
      <div style={styles.card}>
        {/* inner keyline frame for editorial polish */}
        <div style={styles.keyline} aria-hidden="true" />

        {/* Brand strip */}
        <div style={styles.brand}>
          <p style={styles.eyebrow}>VOW</p>
        </div>

        {/* Hero */}
        <div style={styles.hero}>
          <div style={styles.glyphWrap}><AnchorGlyph /></div>
          <p style={styles.heroLabel}>You are an anchor for</p>
          <h1 style={styles.heroName}>{data.user_first_name}</h1>
        </div>

        <div style={styles.rule} />

        {/* Streak */}
        <div style={styles.streakBlock}>
          <p style={styles.streakNum}>{data.current_streak_days}</p>
          <p style={styles.streakUnit}>days held</p>
          <p style={styles.streakSub}>
            {data.user_first_name} is staying the course
            {data.longest_addiction_name ? <> with their {data.longest_addiction_name.toLowerCase()} journey</> : null}.
          </p>
        </div>

        {/* Supportive line */}
        <p style={styles.supportLine}>
          A small word of encouragement can carry further than you know.
          Send one when it feels right.
        </p>

        {/* Reactions */}
        <div style={styles.reactionsWrap}>
          {REACTIONS.map(({ text, Glyph }) => {
            const isSent = sentReactions.includes(text)
            const isSending = sending === text
            return (
              <button
                key={text}
                onClick={() => sendReaction(text)}
                disabled={isSent || isSending}
                style={{
                  ...styles.reactionBtn,
                  ...(isSent ? styles.reactionBtnSent : {}),
                }}
              >
                <span style={styles.reactionGlyph}>
                  <Glyph size={18} color={isSent ? '#5E7A2E' : '#854F0B'} />
                </span>
                <span style={styles.reactionLabel}>
                  {isSending ? 'Sending…' : isSent ? text : text}
                </span>
                {isSent && (
                  <span style={styles.reactionCheck} aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5E7A2E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {sentReactions.length > 0 && (
          <p style={styles.thanksNote}>
            {allSent ? 'Every word sent.' : 'Sent.'} {data.user_first_name} will see {sentReactions.length > 1 ? 'them' : 'it'}.
          </p>
        )}

        <div style={styles.rule} />

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
    background: 'linear-gradient(180deg, #F2ECE0 0%, #EFE7D8 60%, #F2ECE0 100%)',
    padding: '2.5rem 1.25rem',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    fontFamily: 'Georgia, "Times New Roman", serif',
  },
  card: {
    position: 'relative',
    background: 'linear-gradient(180deg, #FDFBF6 0%, #FAF7F1 100%)',
    maxWidth: '440px', width: '100%',
    borderRadius: '24px',
    padding: '3rem 2.25rem 2.5rem',
    boxShadow: '0 20px 60px -12px rgba(60,40,20,0.18), 0 2px 10px rgba(60,40,20,0.05)',
    border: '0.5px solid #E8DCC2',
  },
  keyline: {
    position: 'absolute', inset: '14px',
    border: '1px solid #EADFC8',
    borderRadius: '16px',
    pointerEvents: 'none',
  },
  loading: {
    textAlign: 'center', color: '#9C8C78',
    padding: '3rem 0', fontFamily: 'Georgia, serif', fontStyle: 'italic',
  },

  brand: { textAlign: 'center', marginBottom: '1.75rem', position: 'relative' },
  eyebrow: {
    fontSize: '13px', fontWeight: 400, color: '#A07A3C',
    margin: 0, letterSpacing: '0.32em', paddingLeft: '0.32em',
    fontFamily: 'Georgia, serif',
  },

  hero: { textAlign: 'center', marginBottom: '1.5rem', position: 'relative' },
  glyphWrap: {
    width: '64px', height: '64px', borderRadius: '50%',
    margin: '0 auto 1rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'radial-gradient(circle at 50% 38%, #FBF1DD 0%, #F1E3C6 100%)',
    border: '0.5px solid #E3D2AE',
    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.7), 0 4px 14px rgba(133,79,11,0.08)',
  },
  heroLabel: {
    fontSize: '14px', color: '#9C8C78',
    fontStyle: 'italic',
    margin: '0 0 0.4rem',
    fontFamily: 'Georgia, serif',
  },
  heroName: {
    fontSize: '34px', fontWeight: 400, color: '#2A1F15',
    margin: 0, fontFamily: 'Georgia, serif',
    letterSpacing: '-0.01em', lineHeight: 1.1,
  },

  rule: {
    width: '48px', height: '1px',
    background: 'linear-gradient(90deg, transparent, #D9B57A, transparent)',
    margin: '1.5rem auto',
  },

  streakBlock: {
    textAlign: 'center',
    position: 'relative',
  },
  streakNum: {
    fontSize: '72px', fontWeight: 400, color: '#854F0B',
    margin: 0, lineHeight: 1,
    fontFamily: 'Georgia, serif',
    fontVariantNumeric: 'tabular-nums',
  },
  streakUnit: {
    fontSize: '11px', textTransform: 'uppercase',
    letterSpacing: '0.22em', color: '#A07A3C',
    margin: '12px 0 14px', fontWeight: 400,
    fontFamily: 'Georgia, serif',
  },
  streakSub: {
    fontSize: '15px', color: '#5B4F3F',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '0 auto', lineHeight: 1.55, maxWidth: '300px',
  },

  supportLine: {
    fontSize: '15px', color: '#5B4F3F',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    textAlign: 'center', lineHeight: 1.65,
    margin: '1.5rem auto', maxWidth: '320px',
    position: 'relative',
  },

  reactionsWrap: {
    display: 'flex', flexDirection: 'column', gap: '10px',
    position: 'relative',
  },
  reactionBtn: {
    display: 'flex', alignItems: 'center',
    width: '100%', padding: '15px 18px',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E5D9C2',
    borderRadius: '14px',
    fontSize: '15px', color: '#2A1F15',
    fontWeight: 400, cursor: 'pointer',
    fontFamily: 'Georgia, serif',
    transition: 'all 0.15s ease',
    textAlign: 'left',
    gap: '14px',
    boxShadow: '0 2px 8px rgba(80,50,20,0.05)',
  },
  reactionBtnSent: {
    background: 'linear-gradient(180deg, #F0F4E6 0%, #E7EED5 100%)',
    border: '0.5px solid #BBcd96',
    color: '#5E7A2E',
    cursor: 'default',
    boxShadow: 'none',
  },
  reactionGlyph: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  reactionLabel: { flex: 1, fontStyle: 'italic' },
  reactionCheck: {
    marginLeft: 'auto', display: 'flex', alignItems: 'center',
  },

  thanksNote: {
    fontSize: '14px', color: '#5E7A2E',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '1.25rem auto 0',
    padding: '12px 16px',
    background: 'linear-gradient(180deg, #F0F4E6 0%, #E7EED5 100%)',
    borderRadius: '12px',
    border: '0.5px solid #CDDBA8',
    position: 'relative',
  },

  footer: {
    textAlign: 'center',
    position: 'relative',
  },
  footerLine: {
    fontSize: '12px', color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '3px 0', lineHeight: 1.5,
  },

  title: {
    fontSize: '26px', fontWeight: 400, color: '#2A1F15',
    margin: '0 0 0.6rem',
    fontFamily: 'Georgia, serif',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '15px', color: '#5B4F3F',
    textAlign: 'center', lineHeight: 1.6,
    margin: 0, fontFamily: 'Georgia, serif', fontStyle: 'italic',
  },
}