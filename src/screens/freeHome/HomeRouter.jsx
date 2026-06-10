import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

import HomeShell from '../home/HomeShell'

// ===================================================================
// HOME ROUTER
// ===================================================================
// Gates onboarding, then routes every free_state to the unified
// HomeShell (the Tree home). The mode key only decides the sky, the
// counter, and which practices the shell offers — see home/modes.js.
// The old stage-home files remain in the repo but are no longer
// routed; they can be deleted in a later cleanup pass.
// ===================================================================

export default function HomeRouter() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          navigate('/app/welcome')
          return
        }

        const { data: progressRow, error: fetchError } = await supabase
          .from('vow_path_progress')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (fetchError) {
          console.error('Failed to load progress:', fetchError)
          setError('Could not load your home. Please refresh.')
          setLoading(false)
          return
        }

        // No row at all — user hasn't completed onboarding
        if (!progressRow) {
          navigate('/app/onboarding/addiction')
          return
        }

        // No habit picked yet
        if (!progressRow.primary_substance) {
          navigate('/app/onboarding/addiction')
          return
        }

        // No starting point chosen yet
        if (!progressRow.free_state) {
          navigate('/app/onboarding/state-picker')
          return
        }

        setProgress(progressRow)
        setLoading(false)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Something went wrong.')
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  if (loading) {
    return (
      <div style={loadingStyles.frame}>
        <div style={loadingStyles.card}>Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={loadingStyles.frame}>
        <div style={loadingStyles.errorCard}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} style={loadingStyles.refreshBtn}>
            Refresh
          </button>
        </div>
      </div>
    )
  }

  if (!progress) return null

  const KNOWN = ['notice', 'reflect', 'commit', 'endure', 'build', 'reclaim']
  if (!KNOWN.includes(progress.free_state)) {
    navigate('/app/onboarding/state-picker')
    return null
  }

  return <HomeShell progress={progress} />
}

const loadingStyles = {
  frame: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)',
    padding: '2rem 1rem',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    background: '#FAF7F1',
    maxWidth: '440px',
    width: '100%',
    borderRadius: '28px',
    padding: '5rem 2rem',
    textAlign: 'center',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10)',
  },
  errorCard: {
    background: '#FAF7F1',
    maxWidth: '440px',
    width: '100%',
    borderRadius: '28px',
    padding: '3rem 2rem',
    textAlign: 'center',
    color: '#B23B3B',
    fontFamily: 'Georgia, serif',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10)',
  },
  refreshBtn: {
    marginTop: '1rem',
    padding: '10px 20px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}