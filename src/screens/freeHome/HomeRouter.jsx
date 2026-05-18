import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

// Free home components — only Notice is fully built initially.
// The others use a placeholder until I send them.
import NoticeFreeHome from './NoticeFreeHome'
import EndureFreeHome from './EndureFreeHome'
import ReflectFreeHome from './ReflectFreeHome'
import CommitFreeHome from './CommitFreeHome'
import BuildFreeHome from './BuildFreeHome'
import ReclaimFreeHome from './ReclaimFreeHome'

// Placeholder for the free homes I haven't sent yet.
// You'll replace these with real imports as files arrive.
function ComingSoonHome({ stageLabel, free_state, navigate }) {
  return (
    <div style={placeholderStyles.frame}>
      <div style={placeholderStyles.card}>
        <div style={placeholderStyles.ornament}>· · ·</div>
        <p style={placeholderStyles.eyebrow}>{stageLabel}</p>
        <h1 style={placeholderStyles.title}>Your home is being prepared.</h1>
        <p style={placeholderStyles.body}>
          The {stageLabel} home screen is being built. You can still access the Vow Path,
          your anchors, and the library from below.
        </p>
        <div style={placeholderStyles.ornament}>· · ·</div>

        <div style={placeholderStyles.actions}>
          <button
            onClick={() => navigate('/vow-path')}
            style={placeholderStyles.primaryBtn}
          >
            Begin the Vow Path
          </button>
          <button
            onClick={() => navigate('/anchors')}
            style={placeholderStyles.secondaryBtn}
          >
            Anchors
          </button>
          <button
            onClick={() => navigate('/library')}
            style={placeholderStyles.secondaryBtn}
          >
            Library
          </button>
          <button
            onClick={() => navigate('/onboarding/state-picker')}
            style={placeholderStyles.linkBtn}
          >
            Change my state
          </button>
        </div>
      </div>
    </div>
  )
}

const placeholderStyles = {
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
    padding: '3rem 2rem',
    textAlign: 'center',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10)',
  },
  ornament: {
    fontSize: '14px',
    color: '#C5AE8A',
    letterSpacing: '0.5em',
    margin: '0 0 1.25rem',
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
    fontSize: '24px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 1rem',
  },
  body: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.65,
    margin: '0 0 2rem',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '1.5rem',
  },
  primaryBtn: {
    padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  secondaryBtn: {
    padding: '12px',
    background: 'white',
    color: '#2A1F15',
    border: '0.5px solid #DDCFB6',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  linkBtn: {
    padding: '8px',
    background: 'transparent',
    color: '#854F0B',
    border: 'none',
    fontSize: '12px',
    fontStyle: 'italic',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
    marginTop: '0.25rem',
  },
}

// Stage label map for the placeholder
const STAGE_LABELS = {
  notice: 'Notice',
  reflect: 'Reflect',
  commit: 'Commit',
  endure: 'Endure',
  build: 'Build',
  reclaim: 'Reclaim',
}

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
          navigate('/welcome')
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
          navigate('/onboarding/addiction')
          return
        }

        // No substance picked yet
        if (!progressRow.primary_substance) {
          navigate('/onboarding/addiction')
          return
        }

        // ─────────────────────────────────────────────────────────────
        // FREE TIER — render the home that matches their free_state
        // ─────────────────────────────────────────────────────────────
        if (!progressRow.free_state) {
          // No free state set — send to state picker
          navigate('/onboarding/state-picker')
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

  // ─────────────────────────────────────────────────────────────────
  // ROUTE TO THE RIGHT FREE HOME based on free_state
  // ─────────────────────────────────────────────────────────────────
  const freeState = progress.free_state
  const stageLabel = STAGE_LABELS[freeState] || 'Home'

  switch (freeState) {
    case 'notice':
      return <NoticeFreeHome progress={progress} />

    // The following will be replaced with real components as I send them
    case 'reflect':
  return <ReflectFreeHome progress={progress} />

    case 'commit':
      return <CommitFreeHome progress={progress} />

    case 'endure':
  return <EndureFreeHome progress={progress} />

    case 'build':
      return <BuildFreeHome progress={progress} />

    case 'reclaim':
      return <ReclaimFreeHome progress={progress} />

    default:
      // Unknown state — send back to picker
      navigate('/onboarding/state-picker')
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