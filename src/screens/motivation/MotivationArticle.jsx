import { useNavigate, useParams } from 'react-router-dom'
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
    background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)',
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