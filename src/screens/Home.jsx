import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Home() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [progress, setProgress] = useState(null)
  const [completedCount, setCompletedCount] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoaded(true); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.first_name) {
        setFirstName(profile.first_name)
      } else if (user.email) {
        setFirstName(user.email.split('@')[0])
      }

      const { data: progressRow } = await supabase
        .from('vow_path_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      setProgress(progressRow)

      // If reflecting, also count completed entries for the CTA copy
      if (progressRow?.current_stage === 'reflect') {
        const { count } = await supabase
          .from('vow_artifacts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('stage', 'reflect')
        setCompletedCount(count || 0)
      }

      setLoaded(true)
    }
    load()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/app/welcome')
  }

  // Determine CTA state
  const ctaState = (() => {
    if (!progress) return 'start'
    if (progress.current_stage !== 'reflect') return 'start'
    if (completedCount >= 21) return 'completed'
    return 'in_progress'
  })()

  const handleCtaClick = () => {
    if (ctaState === 'start' || ctaState === 'completed') {
      navigate('/app/vow-path')
      return
    }
    if (ctaState === 'in_progress') {
      navigate('/app/vow-path/reflect')
    }
  }

  const ctaCopy = (() => {
    if (ctaState === 'start') {
      return {
        head: 'Begin the Vow Path.',
        body: `A guided journey, designed for exactly where you are. Six stages. Personalized to you. Take the short check and we'll show you the way.`,
        button: 'Begin',
        micro: 'Two minutes. Fifteen questions. Free to take.',
      }
    }
    if (ctaState === 'completed') {
      return {
        head: 'Reflect is complete.',
        body: `You've walked through all 21 days. Take the Stage Check again to see where you are now.`,
        button: 'Take the Stage Check again',
        micro: 'Your previous entries are preserved.',
      }
    }
    // in_progress
    return {
      head: 'Continue Reflect.',
      body: `${completedCount} of 21 days complete. Open the journey to pick up where you are.`,
      button: 'Open Reflect',
      micro: '',
    }
  })()

  if (!loaded) {
    return (
      <div style={styles.frame}>
        <div style={{ ...styles.phone, textAlign: 'center', color: '#9C8C78', paddingTop: '4rem' }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        <div style={styles.topBar}>
          <button onClick={handleSignOut} style={styles.signOutBtn}>
            Sign out
          </button>
        </div>

        <div style={styles.greetingBlock}>
          <p style={styles.brandLine}>Vow</p>
          <p style={styles.tagline}>Keep the vow.</p>
        </div>

        <div style={styles.divider}></div>

        {firstName && (
          <p style={styles.greeting}>Hello, {firstName}.</p>
        )}

        <div style={styles.ctaCard}>
          <div style={styles.ctaGlyph}>🌿</div>
          <p style={styles.ctaHead}>{ctaCopy.head}</p>
          <p style={styles.ctaBody}>{ctaCopy.body}</p>
          <button
            onClick={handleCtaClick}
            style={styles.primaryBtn}
          >
            {ctaCopy.button}
          </button>
          {ctaCopy.micro && (
            <p style={styles.ctaMicro}>{ctaCopy.micro}</p>
          )}
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
    padding: '1.5rem 1.5rem 2rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
    minHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
  },
  topBar: {
    display: 'flex', justifyContent: 'flex-end',
    marginBottom: '0.5rem',
  },
  signOutBtn: {
    background: 'transparent', border: 'none',
    color: '#9C8C78', fontSize: '12px',
    cursor: 'pointer', fontFamily: 'inherit',
    padding: '4px 8px',
  },
  greetingBlock: {
    textAlign: 'center', marginTop: '1rem', marginBottom: '0.5rem',
  },
  brandLine: {
    fontSize: '32px', fontWeight: 500, color: '#2A1F15',
    margin: 0, letterSpacing: '-0.02em',
    fontFamily: 'Georgia, serif',
  },
  tagline: {
    fontSize: '13px', color: '#854F0B',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    margin: '4px 0 0',
  },
  divider: {
    height: '0.5px', background: '#E8DFD0',
    margin: '1.5rem 0',
  },
  greeting: {
    fontSize: '20px', color: '#2A1F15',
    margin: '0 0 1.5rem',
    fontFamily: 'Georgia, serif',
    textAlign: 'center',
  },
  ctaCard: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '20px',
    padding: '1.75rem 1.5rem',
    textAlign: 'center',
    boxShadow: '0 4px 16px rgba(80,50,20,0.06)',
    marginTop: '0.5rem',
  },
  ctaGlyph: {
    fontSize: '40px', marginBottom: '0.75rem',
  },
  ctaHead: {
    fontSize: '22px', fontWeight: 500, color: '#2A1F15',
    margin: '0 0 0.75rem', fontFamily: 'Georgia, serif',
    lineHeight: 1.3,
  },
  ctaBody: {
    fontSize: '14px', color: '#6B5C4A',
    margin: '0 0 1.5rem', lineHeight: 1.65,
    fontFamily: 'Georgia, serif',
  },
  primaryBtn: {
    width: '100%', padding: '16px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none', borderRadius: '14px',
    fontSize: '15px', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  ctaMicro: {
    fontSize: '11px', color: '#9C8C78',
    margin: '0.75rem 0 0',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
  },
}