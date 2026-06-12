import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { getArticleBySlug } from './data/articles'

export default function MotivationArticle() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const article = getArticleBySlug(slug)

  if (!article) {
    return (
      <div style={styles.frame}>
        <div style={styles.phone}>
          <Header navigate={navigate} />
          <div style={styles.notFound}>
            <p style={styles.notFoundTitle}>Article not found</p>
            <p style={styles.notFoundText}>
              We don't have an article at "{slug}".
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>
        <Header navigate={navigate} />
        <ReadTracker article={article} />

        {/* HERO */}
        <div style={styles.hero}>
          <h1 style={styles.title}>{article.title}</h1>
          {article.subtitle && (
            <p style={styles.subtitle}>{article.subtitle}</p>
          )}
          <p style={styles.meta}>{article.readMinutes} min read</p>
          <div style={styles.heroOrnament}>· · ·</div>
        </div>

        {/* ARTICLE */}
        <article style={styles.article}>
          {article.paragraphs.map((para, i) => {
            // A paragraph is either a plain string or { text, style }.
            // style === 'anchor' renders the short italic/centered lines the
            // articles were written around. Plain strings render as normal.
            const text = typeof para === 'string' ? para : para.text
            const variant = typeof para === 'string' ? null : para.style
            const isFirst = i === 0

            if (variant === 'anchor') {
              return (
                <p key={i} style={styles.anchor}>{text}</p>
              )
            }

            return (
              <p key={i} style={isFirst ? styles.firstPara : styles.para}>
                {isFirst ? (
                  <>
                    <span style={styles.dropCap}>{text.charAt(0)}</span>
                    {text.slice(1)}
                  </>
                ) : (
                  text
                )}
              </p>
            )
          })}
        </article>

        {/* END */}
        <div style={styles.endOrnament}>· · ·</div>
      </div>
    </div>
  )
}

// ===================================================================
// READ TRACKER — the honest read detector.
// ===================================================================
// A star is earned only when BOTH are true: the article has been
// visibly open for at least 45% of its estimated read time (minimum
// 25 seconds — the clock pauses whenever the tab loses focus), AND
// the reader has actually reached ~88% of the way down. Open-and-
// close earns nothing; a real read earns the beat and one signal:
// free_stage_signals · signal_type 'motivation_read' ·
// payload { slug, date, seconds, depth } — once per article, ever.
// Renders the gold reading hairline at the top and, on earning,
// the floating "A star lit in your sky" beat.
// ===================================================================
function ReadTracker({ article }) {
  const [progress, setProgress] = useState(0)
  const [earned, setEarned] = useState(false)
  const alreadyRef = useRef(true)   // assume read until proven otherwise
  const secsRef = useRef(0)
  const depthRef = useRef(0)
  const doneRef = useRef(false)

  const needSecs = Math.max(25, Math.round((article.readMinutes || 4) * 60 * 0.45))

  useEffect(() => {
    let cancelled = false
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return
      const { data } = await supabase
        .from('free_stage_signals')
        .select('payload')
        .eq('user_id', user.id)
        .eq('signal_type', 'motivation_read')
      if (cancelled) return
      const slugs = (data || []).map(r => r.payload?.slug)
      alreadyRef.current = slugs.includes(article.slug)
    }
    check()
    return () => { cancelled = true }
  }, [article.slug])

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const depth = Math.min(1, (window.scrollY + window.innerHeight) / Math.max(1, doc.scrollHeight))
      if (depth > depthRef.current) depthRef.current = depth
      setProgress(depth)
      maybeEarn()
    }
    const tick = setInterval(() => {
      if (document.visibilityState === 'visible') {
        secsRef.current += 1
        maybeEarn()
      }
    }, 1000)
    async function maybeEarn() {
      if (doneRef.current || alreadyRef.current) return
      if (secsRef.current < needSecs || depthRef.current < 0.88) return
      doneRef.current = true
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { doneRef.current = false; return }
      const d = new Date()
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const { error } = await supabase.from('free_stage_signals').insert({
        user_id: user.id, stage: 'notice', signal_type: 'motivation_read',
        payload: { slug: article.slug, date, seconds: secsRef.current, depth: Math.round(depthRef.current * 100) },
      })
      if (error) { doneRef.current = false; return }
      setEarned(true)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { window.removeEventListener('scroll', onScroll); clearInterval(tick) }
  }, [article.slug, needSecs])

  return (
    <>
      <div style={trk.track}>
        <div style={{ ...trk.fill, width: `${Math.round(progress * 100)}%` }} />
      </div>
      {earned && (
        <div style={trk.beat}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#EFDCAF"><path d="M12 3l2.2 5.3L20 9l-4.3 3.8L17 19l-5-3-5 3 1.3-6.2L4 9l5.8-.7z" /></svg>
          <span style={trk.beatText}>A star lit in your sky.</span>
        </div>
      )}
    </>
  )
}

const trk = {
  track: { position: 'sticky', top: 0, zIndex: 5, height: '3px', background: '#EFE7D7', margin: '-1.5rem -2rem 1.25rem', borderRadius: '2px' },
  fill: { height: '3px', background: 'linear-gradient(90deg, #D9B57A, #C9A85C)', transition: 'width 0.15s ease-out', borderRadius: '2px' },
  beat: { position: 'fixed', left: '50%', bottom: '26px', transform: 'translateX(-50%)', zIndex: 50, display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 18px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', borderRadius: '999px', boxShadow: '0 10px 28px -8px rgba(30,18,8,0.55)', border: '0.5px solid rgba(217,181,122,0.4)' },
  beatText: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '12.5px', color: '#EFDCAF' },
}

function Header({ navigate }) {
  return (
    <div style={styles.topBar}>
      <button onClick={() => navigate('/app/motivation')} style={styles.backBtn}>‹ Back</button>
      <p style={styles.topBarTitle}>Motivation</p>
      <div style={{ width: '60px' }}></div>
    </div>
  )
}

const styles = {
  frame: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #FDFBF6 0%, #F6EFDD 100%)',
    padding: '2rem 1rem',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  phone: {
    background: '#FAF7F1',
    maxWidth: '620px',
    width: '100%',
    borderRadius: '28px',
    padding: '1.5rem 2rem 2.5rem',
    boxShadow: '0 14px 40px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },

  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '2rem',
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
    paddingTop: '1rem',
    paddingBottom: '0.5rem',
    marginBottom: '2.5rem',
  },
  title: {
    fontSize: '36px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.2,
    margin: '0 auto 1rem',
    letterSpacing: '-0.015em',
    maxWidth: '480px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.55,
    margin: '0 auto 1.5rem',
    maxWidth: '420px',
  },
  meta: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    marginBottom: '1.5rem',
    fontVariantNumeric: 'tabular-nums',
  },
  heroOrnament: {
    fontSize: '14px',
    color: '#C5AE8A',
    letterSpacing: '0.5em',
    marginTop: '0.25rem',
  },

  article: {
    paddingBottom: '1rem',
    maxWidth: '560px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  para: {
    fontSize: '16.5px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.85,
    margin: '0 0 1.4rem',
    letterSpacing: '0.005em',
  },
  firstPara: {
    fontSize: '17px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.85,
    margin: '0 0 1.4rem',
    letterSpacing: '0.005em',
  },
  anchor: {
    fontSize: '18px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    textAlign: 'center',
    margin: '2.25rem auto',
    maxWidth: '430px',
    letterSpacing: '0.01em',
  },
  dropCap: {
    float: 'left',
    fontSize: '52px',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 0.95,
    paddingTop: '6px',
    paddingRight: '10px',
    paddingBottom: '0px',
    color: '#854F0B',
  },
  endOrnament: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#C5AE8A',
    letterSpacing: '0.5em',
    margin: '2.5rem 0 1rem',
  },

  notFound: {
    textAlign: 'center',
    padding: '3rem 1rem',
  },
  notFoundTitle: {
    fontSize: '20px', color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: '0 0 0.75rem',
  },
  notFoundText: {
    fontSize: '14px', color: '#6B5C4A',
    fontFamily: 'Georgia, serif', fontStyle: 'italic',
    lineHeight: 1.6, margin: 0,
  },
}