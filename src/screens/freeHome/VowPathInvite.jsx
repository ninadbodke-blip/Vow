import { useNavigate } from 'react-router-dom'

// =====================================================================
// VowPathInvite — the one reusable invitation toward the paid Vow Path.
// Two variants, both in Vow's calm cream/serif voice:
//   • variant="calm"  (default): a quiet, contextual invitation for the
//     bottom of a free-home screen. Speaks to the stage the user is in.
//   • variant="moment": a slightly warmer, more direct nudge that rides a
//     genuine positive moment (a logged win, a streak, a milestone).
//
// NEVER mount this in crisis/vulnerable paths (active craving, slip/Reclaim
// support, urge/quick-logging) — those stay invitation-free by design.
//
// Tapping routes into the assessment → paywall flow (the substance step,
// which is the front door to stage assessment and the paywall).
// =====================================================================

// Per-stage contextual copy: what the free user is doing on their own, and how
// the Path deepens it. Kept here so all copy lives in one place.
const STAGE_COPY = {
  notice: {
    line: 'You’re noticing the pattern on your own. The Vow Path walks the Notice work with you \u2014 a little each day, in order.',
  },
  reflect: {
    line: 'You’re reflecting in your own time. The Vow Path gives that reflection a shape \u2014 a guided way through, one day at a time.',
  },
  commit: {
    line: 'You’re getting ready in your own way. The Vow Path turns that readiness into a plan \u2014 day by day, up to the moment you choose.',
  },
  endure: {
    line: 'You’re holding the line yourself. The Vow Path stays beside you through the early days \u2014 steady, one day at a time.',
  },
  build: {
    line: 'You’re building the life around it on your own. The Vow Path gives that work a weekly rhythm \u2014 something to return to.',
  },
  reclaim: {
    line: 'You’re finding your feet again. The Vow Path offers a gentler way back \u2014 in your own time, with something to hold onto.',
  },
  default: {
    line: 'You’re doing this work on your own. The Vow Path walks it with you \u2014 a guided way through, one day at a time.',
  },
}

export default function VowPathInvite({ stage = 'default', variant = 'calm', momentLabel }) {
  const navigate = useNavigate()
  const copy = STAGE_COPY[stage] || STAGE_COPY.default
  const isMoment = variant === 'moment'

  const go = () => navigate('/app/vow-path/substance')

  return (
    <div style={{ ...S.tile, ...(isMoment ? S.tileMoment : {}) }}>
      <p style={S.eyebrow}>{isMoment ? (momentLabel || 'A good moment') : 'The Vow Path'}</p>
      <p style={S.body}>
        {isMoment
          ? 'You showed up today. If you’re ready to go deeper, the Vow Path walks the whole way with you \u2014 one guided day at a time.'
          : copy.line}
      </p>
      <button onClick={go} style={{ ...S.btn, ...(isMoment ? S.btnMoment : {}) }}>
        {isMoment ? 'Explore the Vow Path' : 'See the Vow Path'}
        <span style={S.arrow}>→</span>
      </button>
    </div>
  )
}

const S = {
  tile: {
    background: 'linear-gradient(180deg, #FDFBF6 0%, #FBF7EE 100%)',
    border: '0.5px solid #E5D9C2',
    borderRadius: '18px',
    padding: '18px 18px 16px',
    margin: '8px 0',
    boxSizing: 'border-box',
  },
  tileMoment: {
    background: 'linear-gradient(180deg, #FBF6EE 0%, #F6EDDC 100%)',
    border: '0.5px solid #D9B57A',
  },
  eyebrow: {
    fontSize: '11px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    margin: '0 0 8px',
  },
  body: {
    fontSize: '14.5px',
    color: '#3A2A1C',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.55,
    margin: '0 0 14px',
    overflowWrap: 'break-word',
  },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    background: 'transparent',
    border: '0.5px solid #C9A85C',
    borderRadius: '11px',
    padding: '10px 16px',
    color: '#854F0B',
    fontSize: '13.5px',
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
  },
  btnMoment: {
    background: 'linear-gradient(180deg, #3A2A1C, #241710)',
    border: 'none',
    color: '#F6E8C4',
  },
  arrow: { fontSize: '15px', lineHeight: 1 },
}