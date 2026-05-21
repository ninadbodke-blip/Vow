import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QUOTES, getTodayQuote } from './data/quotes'
import { ARTICLES } from './data/articles'
import { supabase } from '../../supabaseClient'
import BottomNav from '../../components/BottomNav'

const ProfileIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
)

export default function MotivationHome() {
  const navigate = useNavigate()
  const [showPast, setShowPast] = useState(false)
  const [userSubstance, setUserSubstance] = useState(null)

  useEffect(() => {
    let active = true
    async function loadSubstance() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('vow_path_progress')
        .select('primary_substance')
        .eq('user_id', user.id)
        .maybeSingle()
      if (active && data?.primary_substance) setUserSubstance(data.primary_substance)
    }
    loadSubstance()
    return () => { active = false }
  }, [])

  // Universal articles (substance === null) show to everyone. Substance-tagged
  // articles surface only to the user whose primary_substance matches.
  const visibleArticles = ARTICLES.filter(
    a => a.substance === null || a.substance === userSubstance
  )

  const todayQuote = getTodayQuote()
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        {/* HEADER */}
        <div style={styles.header}>
          <div style={{ width: '40px' }}></div>
          <p style={styles.headerTitle}>Motivation</p>
          <button
            onClick={() => navigate('/profile')}
            style={styles.profileBtn}
            aria-label="Profile"
          >
            <ProfileIcon />
          </button>
        </div>

        {/* TODAY'S QUOTE */}
        <div style={styles.todayCard}>
          <p style={styles.todayLabel}>TODAY · {today.toUpperCase()}</p>
          <p style={styles.quoteText}>{todayQuote.text}</p>
          {todayQuote.attribution && (
            <p style={styles.attribution}>— {todayQuote.attribution}</p>
          )}
        </div>

        {/* ARTICLES */}
        <div style={styles.section}>
          <p style={styles.sectionLabel}>Articles</p>
          <div style={styles.articleList}>
            {visibleArticles.map(article => (
              <button
                key={article.id}
                onClick={() => navigate(`/motivation/article/${article.slug}`)}
                style={styles.articleCard}
              >
                <p style={styles.articleTitle}>{article.title}</p>
                <span style={styles.articleMeta}>{article.readMinutes} min</span>
              </button>
            ))}
          </div>
        </div>

        {/* ALL QUOTES (collapsible) */}
        <button
          onClick={() => setShowPast(!showPast)}
          style={styles.pastToggle}
          aria-expanded={showPast}
        >
          <span>All quotes</span>
          <span style={styles.chevron}>{showPast ? '⌃' : '⌄'}</span>
        </button>

        {showPast && (
          <div style={styles.pastList}>
            {QUOTES.map(q => (
              <div key={q.id} style={styles.pastQuote}>
                <p style={styles.pastText}>{q.text}</p>
                {q.attribution && (
                  <p style={styles.pastAttribution}>— {q.attribution}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <BottomNav />
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
    padding: '1.5rem 1.5rem 2.5rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
  },
  headerTitle: {
    fontSize: '17px', fontWeight: 500, color: '#2A1F15',
    margin: 0, fontFamily: 'Georgia, serif',
    textAlign: 'center', flex: 1,
  },
  profileBtn: {
    background: 'transparent', border: 'none',
    color: '#854F0B',
    cursor: 'pointer', fontFamily: 'inherit',
    padding: '4px 8px',
    minWidth: '40px',
    display: 'flex', justifyContent: 'flex-end',
  },

  todayCard: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '20px',
    padding: '2.5rem 1.5rem 2rem',
    textAlign: 'center',
    marginBottom: '2rem',
    boxShadow: '0 4px 16px rgba(80,50,20,0.06)',
  },
  todayLabel: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 1.5rem',
  },
  quoteText: {
    fontSize: '22px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.5,
    margin: '0 0 1.25rem',
    maxWidth: '340px',
    marginLeft: 'auto', marginRight: 'auto',
  },
  attribution: {
    fontSize: '13px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    margin: 0,
  },

  section: {
    marginBottom: '1.75rem',
  },
  sectionLabel: {
    fontSize: '11px',
    color: '#9C8C78',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.75rem',
    paddingLeft: '4px',
  },
  articleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  articleCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '16px',
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
  articleTitle: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: 0,
    lineHeight: 1.35,
    flex: 1,
  },
  articleMeta: {
    fontSize: '11px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },

  pastToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '14px 4px',
    background: 'transparent',
    border: 'none',
    borderTop: '0.5px solid #E8DFD0',
    marginTop: '0.5rem',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
    fontSize: '13px',
    color: '#6B5C4A',
    fontStyle: 'italic',
    fontWeight: 500,
  },
  chevron: {
    color: '#854F0B',
    fontSize: '14px',
    fontStyle: 'normal',
  },
  pastList: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '0.5rem',
  },
  pastQuote: {
    padding: '1.25rem 0.5rem',
    borderBottom: '0.5px solid #EFE7D7',
  },
  pastText: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.55,
    margin: '0 0 0.5rem',
  },
  pastAttribution: {
    fontSize: '12px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    margin: 0,
  },
}