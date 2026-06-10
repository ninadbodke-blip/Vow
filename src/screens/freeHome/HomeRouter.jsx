import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

// The new unified home (Tree + shell). Modes migrate onto it one at a
// time; until then they keep their existing stage homes below.
import HomeShell from '../home/HomeShell'

import NoticeFreeHome from './NoticeFreeHome'
import ReflectFreeHome from './ReflectFreeHome'
import CommitFreeHome from './CommitFreeHome'
import BuildFreeHome from './BuildFreeHome'
import ReclaimFreeHome from './ReclaimFreeHome'

// ===================================================================
// HOME ROUTER
// ===================================================================
// Gates onboarding, then routes by free_state:
//   endure                        → HomeShell (the new Tree home)
//   notice/reflect/commit/build/
//   reclaim                       → their existing homes (unchanged)
// As each mode's practices migrate, move its case up to HomeShell and
// delete its old import.
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

  switch (progress.free_state) {
    case 'endure':
      return <HomeShell progress={progress} />

    // Not yet migrated to the new home — unchanged for pilot users.
    case 'notice':
      return <NoticeFreeHome progress={progress} />
    case 'reflect':
      return <ReflectFreeHome progress={progress} />
    case 'commit':
      return <CommitFreeHome progress={progress} />
    case 'build':
      return <BuildFreeHome progress={progress} />
    case 'reclaim':
      return <ReclaimFreeHome progress={progress} />

    default:
      // Unknown state — send back to picker
      navigate('/app/onboarding/state-picker')
      return null
  }
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