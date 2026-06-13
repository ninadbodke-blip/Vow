import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { STAGE_ORDER } from './utils/stageAccess'
import VowPathMark from '../../components/VowPathMark'

// =====================================================================
// VOW PATH HUB — "The Pilgrimage Trail"
// An inked map of the program: each stage is a waypoint medallion (its
// sumi-e art held in a soft ink circle, ringed in the stage accent) set
// along a hand-drawn route that runs solid where you've walked and faint
// where you haven't. Reclaim branches off as an always-open side path.
//
// Placement logic (load / getStageStatus / handleStageTap) is unchanged.
// Medallion art lives at /public/medallions/{stage}.webp (square, 1:1).
// If a file is missing, the medallion falls back to a quiet ink wash.
// =====================================================================

const STAGES = [
  { key: 'notice',  number: '01', roman: 'I',   label: 'Notice',  clinical: 'Pre-contemplation', duration: '5 days',           tagline: "Looking carefully, before you know what you're looking at.", accent: '#A89B85' },
  { key: 'reflect', number: '02', roman: 'II',  label: 'Reflect', clinical: 'Contemplation',     duration: '21 days',          tagline: 'Sitting with whether this matters.',                        accent: '#C9A96E' },
  { key: 'commit',  number: '03', roman: 'III', label: 'Commit',  clinical: 'Preparation',       duration: '10 days',          tagline: 'Gathering yourself.',                                       accent: '#B57842' },
  { key: 'endure',  number: '04', roman: 'IV',  label: 'Endure',  clinical: 'Action',            duration: '21 days',          tagline: 'Walking through.',                                          accent: '#C5572C' },
  { key: 'build',   number: '05', roman: 'V',   label: 'Build',   clinical: 'Maintenance',       duration: '9 weekly entries', tagline: 'Living the vow.',                                           accent: '#854F0B' },
  { key: 'reclaim', number: '06', roman: 'VI',  label: 'Reclaim', clinical: 'Recycling',         duration: 'always open',      tagline: 'Beginning again.',                                          accent: '#9C6E5A' },
]

export default function VowPathIntro() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/app/welcome'); return }

      const { data: progressRow } = await supabase
        .from('vow_path_progress')
        .select('current_stage')
        .eq('user_id', user.id)
        .maybeSingle()

      setProgress(progressRow)
      setLoading(false)
    }
    load()
  }, [navigate])

  const currentStage = progress?.current_stage
  // 'pre_stage_check' is a placeholder written when the substance step is done
  // but the assessment/entry isn't finished. Only treat the user as "assessed"
  // when current_stage is a REAL stage — otherwise they should resume the check,
  // not see a broken "Continue your chapter" that routes nowhere.
  const hasAssessment = STAGE_ORDER.includes(currentStage)
  const assessmentInProgress = !!currentStage && !hasAssessment

  const getStageStatus = (stageKey) => {
    if (!hasAssessment) return 'pre_assessment'
    if (stageKey === currentStage) return 'current'
    // Reclaim is not a sequential stage — it's relapse support, always available.
    if (stageKey === 'reclaim') return 'relapse_support'
    const ci = STAGE_ORDER.indexOf(currentStage)
    const ti = STAGE_ORDER.indexOf(stageKey)
    if (ti >= 0 && ci >= 0 && ti < ci) return 'visited'   // past stage — explorable
    return 'locked'                                        // future stage
  }

  const handleStageTap = (stageKey) => {
    const status = getStageStatus(stageKey)
    if (status === 'pre_assessment' || status === 'locked') return
    if (status === 'relapse_support') { navigate('/app/vow-path/reclaim'); return }
    if (status === 'current' || status === 'visited') navigate(`/app/vow-path/${stageKey}`)
  }

  if (loading) {
    return (
      <div style={styles.frame}>
        <div style={{ ...styles.phone, textAlign: 'center', color: '#9C8C78', paddingTop: '4rem' }}>Loading…</div>
      </div>
    )
  }

  const journey = STAGES.filter((s) => s.key !== 'reclaim')
  const reclaim = STAGES.find((s) => s.key === 'reclaim')
  const reclaimStatus = getStageStatus('reclaim')
  const reclaimInteractive = hasAssessment

  const stateClass = (status) =>
    status === 'current' ? 'is-current'
      : status === 'visited' ? 'is-done'
      : status === 'pre_assessment' ? 'is-preview'
      : 'is-future'

  const Medallion = ({ stageKey, accent, status, small }) => (
    <div className={`vpi-medallion ${small ? 'vpi-medallion-sm' : ''}`} style={{ '--accent': accent }}>
      <div className="vpi-ink">
        <img src={`/medallions/${stageKey}.webp`} alt="" loading="lazy"
          onError={(e) => { e.currentTarget.style.display = 'none' }} />
      </div>
      <div className="vpi-ring" />
      {status === 'current' && (
        <span className="vpi-flamepip" aria-hidden="true">
          <svg viewBox="0 0 100 100" width="15" height="15">
            <path d="M50 12 Q72 48 50 92 Q28 48 50 12" fill="#854F0B" />
            <path d="M50 40 Q62 66 50 92 Q38 66 50 40" fill="#D9B57A" />
          </svg>
        </span>
      )}
      {status === 'visited' && <span className="vpi-seal" />}
      {!small && <span className="vpi-numeral">{STAGES.find((s) => s.key === stageKey)?.roman}</span>}
    </div>
  )

  return (
    <div style={styles.frame}>
      <style>{CSS}</style>
      <div style={styles.phone}>
        <div className="vpi-root">

          <div className="vpi-grain" aria-hidden="true" />
          <svg className="vpi-compass" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#854F0B" strokeWidth="1" />
            <circle cx="50" cy="50" r="33" fill="none" stroke="#854F0B" strokeWidth="0.5" />
            <path d="M50 4 L57 50 L50 96 L43 50 Z" fill="#854F0B" />
            <path d="M4 50 L50 43 L96 50 L50 57 Z" fill="#854F0B" opacity="0.6" />
          </svg>

          {/* ---- top bar ---- */}
          <div className="vpi-topbar">
            <button onClick={() => navigate('/app/home')} className="vpi-back">‹ Home</button>
          </div>

          {/* ---- title cartouche (mark + wordmark) ---- */}
          <div className="vpi-cartouche">
            <div className="vpi-mark"><VowPathMark size={44} theme="light" /></div>
            <p className="vpi-wordmark">Vow Path</p>
            <span className="vpi-rule" />
            <p className="vpi-subtitle">Six stages · one journey</p>
          </div>

          <p className="vpi-lede">A path walked at your pace — from the first noticing, to a year past the day you stopped.</p>

          {/* ---- the trail ---- */}
          <div className="vpi-trail">
            {journey.map((s, i) => {
              const status = getStageStatus(s.key)
              const side = i % 2 === 0 ? 'left' : 'right'
              const interactive = status === 'current' || status === 'visited'
              const next = journey[i + 1]
              const nextStatus = next ? getStageStatus(next.key) : null
              const traveled = nextStatus === 'visited' || nextStatus === 'current'

              return (
                <div key={s.key}>
                  <div
                    className={`vpi-stop ${side} ${stateClass(status)} ${interactive ? 'vpi-interactive' : ''}`}
                    style={{ animationDelay: `${0.16 + i * 0.1}s` }}
                    onClick={() => handleStageTap(s.key)}
                  >
                    <Medallion stageKey={s.key} accent={s.accent} status={status} />
                    <div className="vpi-caption">
                      {status === 'current' && <p className="vpi-youhere">You are here</p>}
                      <p className="vpi-meta">{s.clinical} · {s.duration}</p>
                      <h3 className="vpi-name">{s.label}</h3>
                      <p className="vpi-tagline">“{s.tagline}”</p>
                    </div>
                  </div>

                  {next && (
                    <div className="vpi-connector" aria-hidden="true">
                      <svg viewBox="0 0 360 46" preserveAspectRatio="none">
                        <path className={`vpi-route ${traveled ? '' : 'faint'}`}
                          d={side === 'left' ? 'M70 6 C 130 28, 230 22, 300 42' : 'M300 6 C 230 28, 130 22, 60 42'} />
                      </svg>
                    </div>
                  )}
                </div>
              )
            })}

            {/* destination flourish */}
            <div className="vpi-destination" aria-hidden="true">
              <div className="vpi-star">✦ · ✦ · ✦</div>
              <p>a year on</p>
            </div>

            {/* branch to Reclaim — always shown; live once you've begun */}
            <div className="vpi-branch" aria-hidden="true">
              <svg viewBox="0 0 360 42" preserveAspectRatio="none">
                <path className="vpi-route faint" d="M180 2 C 140 20, 110 16, 64 36" />
              </svg>
            </div>
            <div
              className={`vpi-sanctuary ${reclaimInteractive ? 'vpi-interactive' : 'is-preview'} ${reclaimStatus === 'current' ? 'is-current' : ''}`}
              onClick={() => reclaimInteractive && handleStageTap('reclaim')}
            >
              <Medallion stageKey="reclaim" accent={reclaim.accent} status={reclaimStatus} small />
              <div className="vpi-caption">
                {reclaimStatus === 'current' && <p className="vpi-youhere">You are here</p>}
                <p className="vpi-meta vpi-meta-ember">{reclaim.clinical} · {reclaim.duration}</p>
                <h3 className="vpi-name vpi-name-sm">{reclaim.label}</h3>
                <p className="vpi-tagline">“{reclaim.tagline}” &nbsp;·&nbsp; a side path, here if you slip.</p>
              </div>
            </div>
          </div>

          {/* ---- CTA ---- */}
          <div className="vpi-cta">
            {!hasAssessment ? (
              <>
                <button onClick={() => navigate(assessmentInProgress ? '/app/vow-path/check' : '/app/vow-path/substance')} className="vpi-btn">
                  {assessmentInProgress ? 'Finish the Stage Check' : 'Take the Stage Check'} <span>→</span>
                </button>
                <p className="vpi-cta-sub">15 questions. About two minutes. Honest answers, in private.</p>
              </>
            ) : (
              <>
                <button onClick={() => handleStageTap(currentStage)} className="vpi-btn">
                  {currentStage === 'reclaim' ? 'Enter Reclaim' : 'Continue your chapter'} <span>→</span>
                </button>
                <button onClick={() => navigate('/app/vow-path/check')} className="vpi-btn-ghost">
                  Re-take the Stage Check
                </button>
              </>
            )}
          </div>

          <p className="vpi-privacy">Your answers and your work are private. Only you and Vow see them.</p>
        </div>
      </div>
    </div>
  )
}

const SERIF = 'Georgia, "Times New Roman", serif'
const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const styles = {
  frame: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)',
    padding: '2rem 1rem',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: SANS,
  },
  phone: {
    background: '#FAF7F1',
    maxWidth: '460px',
    width: '100%',
    borderRadius: '32px',
    padding: '1.5rem 1.25rem 2.5rem',
    boxShadow: '0 18px 50px rgba(60,40,20,0.10), 0 2px 8px rgba(60,40,20,0.04)',
  },
}

const CSS = `
.vpi-root{position:relative;}
.vpi-grain{position:absolute; inset:-24px -20px; pointer-events:none; opacity:0.42; border-radius:32px;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.05'/></svg>");}
.vpi-compass{position:absolute; top:82px; right:-2px; width:72px; height:72px; opacity:0.10; pointer-events:none;}

.vpi-topbar{position:relative; z-index:2; display:flex; margin-bottom:14px;}
.vpi-back{background:none; border:none; color:#854F0B; font-family:${SANS}; font-size:13px; cursor:pointer; padding:2px 0;}

.vpi-cartouche{position:relative; z-index:2; text-align:center; padding:16px 14px 14px; margin-bottom:6px;
  border:1px solid rgba(133,79,11,0.28); border-radius:15px;
  background:linear-gradient(180deg, rgba(251,246,234,0.6), rgba(244,236,221,0.3));
  animation:vpiRise .7s ease both;}
.vpi-cartouche::after{content:""; position:absolute; inset:5px; border:0.5px solid rgba(133,79,11,0.16); border-radius:11px; pointer-events:none;}
.vpi-mark{display:flex; justify-content:center; margin-bottom:7px;}
.vpi-wordmark{font-family:${SERIF}; font-weight:500; font-size:21px; letter-spacing:0.20em; color:#854F0B; margin:0; text-transform:uppercase;}
.vpi-rule{display:block; width:50px; height:1px; margin:10px auto 8px; background:linear-gradient(90deg,transparent,#D9B57A,transparent);}
.vpi-subtitle{font-family:${SANS}; font-size:9px; letter-spacing:0.28em; text-transform:uppercase; color:#9C8463; margin:0;}
.vpi-lede{position:relative; z-index:2; font-family:${SERIF}; font-style:italic; font-size:14px; line-height:1.6; color:#6B5C4A; text-align:center; margin:16px auto 22px; max-width:290px; animation:vpiRise .7s ease .08s both;}

.vpi-trail{position:relative; z-index:2;}
.vpi-stop{display:flex; align-items:center; gap:16px; opacity:0; animation:vpiRise .6s ease forwards;}
.vpi-stop.right{flex-direction:row-reverse;}
.vpi-stop.right .vpi-caption{text-align:right; align-items:flex-end;}
.vpi-interactive{cursor:pointer;}
.vpi-stop.vpi-interactive:hover .vpi-caption{transform:translateX(4px);}
.vpi-stop.right.vpi-interactive:hover .vpi-caption{transform:translateX(-4px);}

.vpi-medallion{position:relative; width:86px; height:86px; flex-shrink:0;}
.vpi-medallion-sm{width:64px; height:64px;}
.vpi-ink{position:absolute; inset:6px; border-radius:50%; overflow:hidden; background:#F1E8D8;
  -webkit-mask-image:radial-gradient(circle at 50% 42%, #000 60%, transparent 100%);
  mask-image:radial-gradient(circle at 50% 42%, #000 60%, transparent 100%);}
.vpi-ink img{width:100%; height:100%; object-fit:cover; display:block;}
.vpi-ink::before{content:""; position:absolute; inset:-20%;
  background:
    radial-gradient(38% 30% at 38% 30%, rgba(42,31,21,0.7), transparent 70%),
    radial-gradient(30% 44% at 64% 40%, rgba(58,42,28,0.6), transparent 72%),
    radial-gradient(50% 34% at 50% 74%, rgba(42,31,21,0.45), transparent 75%);}
.vpi-ink::after{content:""; position:absolute; inset:0; background:radial-gradient(circle at 50% 38%, var(--accent), transparent 70%); opacity:0.16; mix-blend-mode:multiply;}
.vpi-ring{position:absolute; inset:0; border-radius:50%; border:2px solid var(--accent); box-shadow:0 4px 13px rgba(60,40,20,0.12);}
.vpi-numeral{position:absolute; left:50%; bottom:-11px; transform:translateX(-50%); font-family:${SERIF}; font-style:italic; font-size:12px; color:#854F0B; background:#FAF7F1; padding:0 6px;}
.vpi-seal{position:absolute; bottom:4px; left:50%; transform:translateX(-50%); width:7px; height:7px; border-radius:50%; background:#D9B57A; box-shadow:0 0 0 3px #FAF7F1;}
.vpi-flamepip{position:absolute; top:-9px; right:-7px; width:28px; height:28px; border-radius:50%; background:#FAF7F1; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(120,68,8,0.3);}

.is-future .vpi-ink{filter:grayscale(0.5); opacity:0.42;}
.is-future .vpi-ring{border-style:dashed; border-color:rgba(107,92,74,0.5); box-shadow:none;}
.is-future .vpi-numeral{color:#9C8C78;}
.is-future .vpi-name{color:#7C6E5A;}
.is-preview .vpi-ink{opacity:0.72;}
.is-preview .vpi-ring{box-shadow:none;}
.is-current .vpi-ring{box-shadow:0 0 0 5px rgba(197,87,44,0.10), 0 0 22px 2px rgba(197,87,44,0.30); animation:vpiPulse 2.8s ease-in-out infinite;}

.vpi-caption{display:flex; flex-direction:column; min-width:0; flex:1;}
.vpi-meta{font-family:${SANS}; font-size:9px; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; color:#9C8463; margin:0 0 4px;}
.vpi-meta-ember{color:#C5572C;}
.vpi-name{font-family:${SERIF}; font-weight:400; font-size:27px; line-height:1.02; color:#2A1F15; margin:0 0 6px; letter-spacing:-0.01em; transition:transform .22s ease;}
.vpi-name-sm{font-size:22px; margin:0 0 5px;}
.vpi-tagline{font-family:${SERIF}; font-style:italic; font-size:13.5px; line-height:1.5; color:#6B5C4A; margin:0;}
.vpi-youhere{font-family:${SANS}; font-size:8.5px; font-weight:700; letter-spacing:0.22em; text-transform:uppercase; color:#C5572C; margin:0 0 4px;}

.vpi-connector{height:46px; margin:2px 0;}
.vpi-connector svg{display:block; width:100%; height:100%; overflow:visible;}
.vpi-route{fill:none; stroke:#854F0B; stroke-width:1.6; stroke-linecap:round; stroke-dasharray:1 7;}
.vpi-route.faint{stroke:rgba(107,92,74,0.45);}

.vpi-destination{text-align:center; margin:16px 0 4px;}
.vpi-destination .vpi-star{font-size:14px; color:#D9B57A; letter-spacing:0.4em;}
.vpi-destination p{font-family:${SERIF}; font-style:italic; font-size:11.5px; color:#9C8463; margin:6px 0 0;}
.vpi-branch{height:42px;}
.vpi-branch svg{display:block; width:100%; height:100%; overflow:visible;}

.vpi-sanctuary{position:relative; display:flex; align-items:center; gap:14px; margin-top:2px; padding:14px;
  border:1px dashed #C5572C; border-radius:16px; background:rgba(197,87,44,0.045);}
.vpi-sanctuary.vpi-interactive{cursor:pointer; transition:transform .2s ease, background .2s ease;}
.vpi-sanctuary.vpi-interactive:hover{transform:translateY(-2px); background:rgba(197,87,44,0.08);}
.vpi-sanctuary.is-preview .vpi-ink{opacity:0.6;}

.vpi-cta{position:relative; z-index:2; margin-top:24px; display:flex; flex-direction:column; gap:12px;}
.vpi-btn{width:100%; padding:16px; border:none; border-radius:15px; cursor:pointer; background:linear-gradient(180deg,#3A2A1C,#241710); color:#FAF7F1; font-family:${SANS}; font-size:14px; font-weight:500; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 8px 20px rgba(40,25,10,0.30); transition:transform .2s ease, box-shadow .2s ease;}
.vpi-btn:hover{transform:translateY(-2px); box-shadow:0 12px 26px rgba(40,25,10,0.4);}
.vpi-btn-ghost{width:100%; padding:13px; background:transparent; color:#854F0B; border:0.5px solid #DDCFB6; border-radius:14px; font-size:13px; font-weight:500; font-style:italic; font-family:${SANS}; cursor:pointer;}
.vpi-cta-sub{font-family:${SERIF}; font-style:italic; font-size:11.5px; color:#9C8C78; text-align:center; margin:2px 0 0;}
.vpi-privacy{position:relative; z-index:2; font-family:${SERIF}; font-style:italic; font-size:11px; color:#9C8C78; text-align:center; margin:18px 0 0; line-height:1.5;}

@keyframes vpiRise{from{opacity:0; transform:translateY(12px);} to{opacity:1; transform:translateY(0);}}
@keyframes vpiPulse{0%,100%{box-shadow:0 0 0 5px rgba(197,87,44,0.08),0 0 18px 1px rgba(197,87,44,0.22);}50%{box-shadow:0 0 0 7px rgba(197,87,44,0.13),0 0 26px 3px rgba(197,87,44,0.38);}}
`