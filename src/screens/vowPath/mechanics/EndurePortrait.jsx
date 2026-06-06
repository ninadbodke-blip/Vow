import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'

// DAY 20 — "Who you are now"
// A portrait composed entirely from the user's own taps across Endure. Reads
// the (rebuilt) artifact shapes from Days 2/3/4/6/8/12/15/16/18/19 and weaves
// them into a composed whole, with two visual recaps (nervous-system
// proportion bar, capital profile). Load logic, phases, onSave and the content
// contract are unchanged. (type: 'endurePortrait')
export default function EndurePortrait({ data, onSave, saving }) {
  const {
    pullFromArtifacts,
    composedHeader,
    composedSubtext,
    recognitionPrompt,
    recognitionOptions = [],
  } = data

  const [phase, setPhase] = useState('load')
  const [portraitSections, setPortraitSections] = useState([])
  const [recognition, setRecognition] = useState(null)
  const [missingArtifacts, setMissingArtifacts] = useState([])

  useEffect(() => {
    async function loadArtifacts() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: artifacts } = await supabase
        .from('vow_artifacts')
        .select('artifact_type, content')
        .eq('user_id', user.id)
        .in('artifact_type', pullFromArtifacts)

      const map = {}
      const missing = [...pullFromArtifacts]
      ;(artifacts || []).forEach(a => {
        map[a.artifact_type] = a.content
        const idx = missing.indexOf(a.artifact_type)
        if (idx >= 0) missing.splice(idx, 1)
      })
      setMissingArtifacts(missing)
      setPortraitSections(composePortrait(map))
      setPhase('compose')
    }
    loadArtifacts()
  }, [pullFromArtifacts])

  const finalize = () => {
    onSave({
      portrait_sections: portraitSections,
      missing_artifacts: missingArtifacts,
      recognition_tap: recognition,
      composed_at: new Date().toISOString(),
    })
  }

  // ===================== LOAD =====================
  if (phase === 'load') {
    return <div style={{ ...S.container, textAlign: 'center', padding: '3rem 1rem' }}><p style={{ color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>Assembling your portrait from twenty days of work…</p></div>
  }

  // ===================== COMPOSE =====================
  if (phase === 'compose') {
    return (
      <div style={S.container}>
        <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
          <p style={S.eyebrowC}>Twenty days, assembled</p>
          <h2 style={S.composeTitle}>Your portrait is ready.</h2>
          <p style={S.composeText}>It was made from your own taps across Endure — the states you spent time in, the feelings you named, the path you built for a slip, the shame you dismantled, the capital you mapped, the values you ranked.</p>
          <p style={S.composeItalic}>None of it is generated. All of it is yours.</p>
          {missingArtifacts.length > 0 && <p style={S.composeMissing}>{missingArtifacts.length} {missingArtifacts.length === 1 ? 'section' : 'sections'} couldn't be assembled from your data yet — the portrait is built from what's there.</p>}
        </div>
        <div style={S.footer}><button onClick={() => setPhase('reveal')} style={S.primaryBtn}>Read the portrait ›</button></div>
      </div>
    )
  }

  // ===================== REVEAL =====================
  if (phase === 'reveal') {
    return (
      <div style={S.container}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <p style={S.eyebrowC}>{composedHeader || 'Your portrait, in your own taps.'}</p>
          <h2 style={S.portraitTitle}>Who you are now.</h2>
          <p style={S.portraitSubtext}>{composedSubtext || 'Read it whole. No rush.'}</p>
          <div style={S.ornament}>· · ·</div>
        </div>

        <div>
          {portraitSections.map((section, idx) => (
            <div key={idx} style={{ marginBottom: '2rem' }}>
              <p style={S.sectionHeading}>{section.heading}</p>
              {section.visual?.type === 'proportions' && <ProportionBar data={section.visual.data} />}
              {section.visual?.type === 'capital' && <CapitalBars scores={section.visual.scores} />}
              {section.paragraphs.map((para, pidx) => <p key={pidx} style={S.paragraph}>{para}</p>)}
            </div>
          ))}
        </div>

        <div style={{ ...S.ornament, margin: '1.5rem 0' }}>· · ·</div>
        <div style={S.footer}><button onClick={() => setPhase('recognition')} style={S.primaryBtn}>Continue ›</button></div>
      </div>
    )
  }

  // ===================== RECOGNITION =====================
  return (
    <div style={S.container}>
      <p style={S.eyebrow}>One tap</p>
      <h2 style={S.prompt}>{recognitionPrompt || 'Looking at the portrait:'}</h2>
      <div style={S.optList}>
        {recognitionOptions.map(opt => {
          const on = recognition === opt.id
          return <button key={opt.id} onClick={() => setRecognition(opt.id)} style={{ ...S.opt, ...(on ? S.optOn : {}) }}>{opt.label}</button>
        })}
      </div>
      <div style={S.footer}>
        <button onClick={() => setPhase('reveal')} style={S.secondaryBtn} disabled={saving}>‹ Re-read</button>
        <button onClick={finalize} disabled={!recognition || saving} style={{ ...S.primaryBtnFlex, ...((!recognition || saving) ? S.disabled : {}) }}>{saving ? 'Saving…' : 'Save the portrait'}</button>
      </div>
    </div>
  )
}

// ===================== visual recaps =====================
function ProportionBar({ data }) {
  const order = ['settled', 'wound_up', 'shut_down']
  const C = { settled: '#7A8C5A', wound_up: '#C5572C', shut_down: '#6B7A88' }
  const N = { settled: 'Settled', wound_up: 'Wound up', shut_down: 'Shut down' }
  const present = order.filter(k => (data?.[k] || 0) > 0)
  if (present.length === 0) return null
  return (
    <div style={{ margin: '0.3rem 0 1.1rem' }}>
      <div style={{ display: 'flex', height: '18px', borderRadius: '9px', overflow: 'hidden', border: '0.5px solid #E0D5C2' }}>
        {present.map(k => <div key={k} style={{ width: `${data[k]}%`, background: C[k] }} />)}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '13px', marginTop: '8px', justifyContent: 'center' }}>
        {present.map(k => <span key={k} style={{ fontSize: '11px', color: '#6B5840', fontFamily: 'Georgia, serif' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: C[k], marginRight: '5px' }} />{N[k]} {Math.round(data[k])}%</span>)}
      </div>
    </div>
  )
}

function CapitalBars({ scores }) {
  const order = ['physical', 'human', 'social', 'cultural']
  const N = { physical: 'Physical', human: 'Human', social: 'Social', cultural: 'Cultural' }
  const C = { physical: '#9A7B4F', human: '#A86A3A', social: '#6E7A4A', cultural: '#8A5A1A' }
  const present = order.filter(k => scores && k in scores)
  if (present.length === 0) return null
  const max = Math.max(1, ...present.map(k => scores[k] || 0))
  return (
    <div style={{ margin: '0.3rem 0 1.1rem', display: 'flex', flexDirection: 'column', gap: '7px' }}>
      {present.map(k => (
        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '56px', fontSize: '11px', color: '#6B5840', fontFamily: 'Georgia, serif', textAlign: 'right' }}>{N[k]}</span>
          <div style={{ flex: 1, height: '12px', background: '#F0E7D6', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.round((scores[k] || 0) / max * 100)}%`, height: '100%', background: C[k], borderRadius: '6px' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// =====================================================================
// PORTRAIT COMPOSER — reads the user's own taps, in their (new) shapes
// =====================================================================
function composePortrait(a) {
  const sections = []
  const join = (arr) => arr.length <= 1 ? (arr[0] || '') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1]

  // 1 — Where you have been (Day 18 proportions, else Day 2)
  const d18 = a.endure_day_18, d2 = a.endure_day_2
  if (d18?.proportions && d18?.dominant_state) {
    sections.push({
      heading: 'Where you have been',
      visual: { type: 'proportions', data: d18.proportions },
      paragraphs: [
        `Across these days your nervous system spent most of its time ${stateLabel(d18.dominant_state)}. The bar above is the shape of it — not moods you chose, but the states your body moved through.`,
        `Without the substance as the lever between them, those shifts happen on their own now. Learning to feel them, and to name the rung you are on, is the quiet work underneath all the rest.`,
      ],
    })
  } else if (d2?.current_state) {
    sections.push({
      heading: 'Where you have been',
      paragraphs: [`When you first located yourself, on Day 2, you placed yourself ${stateLabel(d2.current_state)}. The fuller map came later — but naming the state was where it started.`],
    })
  }

  // 2 — What was underneath (Day 3)
  const d3 = a.endure_day_3
  if (d3?.selected_emotions || d3?.custom_emotions) {
    const count = (d3.selected_emotions?.length || 0) + (d3.custom_emotions?.length || 0)
    const fu = { all_familiar: 'All of them were familiar before the substance arrived.', started_before: 'Most of them started long before the substance did.', substance_made_them_worse: 'The substance made some of them worse over time.', first_time_seeing: 'Some of them, you were seeing clearly for the first time.' }[d3.follow_up] || ''
    sections.push({
      heading: 'What was underneath',
      paragraphs: [
        `You lifted the lid on ${count} ${count === 1 ? 'feeling' : 'feelings'} the substance had been holding down. ${fu}`,
        `They were never the problem — they are information, not threats. The substance was only ever the exit you had. The work now is other ways through, so you don't need the old door.`,
      ],
    })
  }

  // 3 — The path for a slip (Day 4)
  const d4 = a.endure_day_4
  if (d4?.protocol) {
    const paras = [`On Day 4 you built a path for if you slip — the first minute, the first hour, the rest of that day — before any slip had happened. That is what makes it usable.`]
    if (d4.reframe_line) paras.push(`And in your own words, the line you would tell yourself: "${d4.reframe_line}"`)
    paras.push(`A slip is data now, not a verdict — and you already know your first move.`)
    sections.push({ heading: 'The path you built', paragraphs: paras })
  }

  // 4 — The shame story (Day 6)
  const d6 = a.endure_day_6
  if (d6?.statement_parts) {
    const p1 = d6.statement_parts.find(p => p.component_id === 'who_i_am')
    if (p1?.picked_label && p1?.reframe) {
      sections.push({
        heading: 'The shame story, dismantled',
        paragraphs: [
          `The shame had been saying you were ${p1.picked_label.toLowerCase().replace(/\.$/, '')}.`,
          `The more accurate description, the one you wrote beside it: ${p1.reframe.toLowerCase().replace(/\.$/, '')}.`,
          `Both are on paper now. The first is what the shame says. The second is what is true.`,
        ],
      })
    }
  }

  // 5 — The flatness (Day 8)
  const d8 = a.endure_day_8
  if (d8 && (d8.flat_count > 0 || d8.still_available_count > 0)) {
    const paras = [`By Day 8 you named where the flatness had settled — ${d8.flat_count || 0} ${(d8.flat_count === 1) ? 'area' : 'areas'} gone quiet — and, against the grain, ${d8.still_available_count || 0} ${(d8.still_available_count === 1) ? 'thing' : 'things'} that still landed. The flatness was real, but never absolute.`]
    if (d8.daily_return_labels?.length) paras.push(`You chose to return to ${join(d8.daily_return_labels.map(s => s.toLowerCase()))} every day — especially on the days they gave almost nothing back. That is how the colour comes back: through use, not before it.`)
    sections.push({ heading: 'The flatness, and the openings', paragraphs: paras })
  }

  // 6 — The ground you stand on (Day 12 + Day 16)
  const d12 = a.endure_day_12, d16 = a.endure_day_16
  if (d12?.capital_scores) {
    const lowestKey = d16?.lowest_capital || findLowestCapital(d12.capital_scores)
    const strongestKey = findHighestCapital(d12.capital_scores)
    const paras = [`You mapped your recovery capital across four kinds. ${capitalLabel(strongestKey)} is carrying the most right now — that is what you lean on. ${capitalLabel(lowestKey)} came out thinnest.`]
    if (d16?.smallest_version) paras.push(`On Day 16 you went into the thinnest one and named the smallest real move toward it: "${d16.smallest_version}"${d16.plan_when ? `, ${d16.plan_when}` : ''}.`)
    sections.push({ heading: 'The ground you stand on', visual: { type: 'capital', scores: d12.capital_scores }, paragraphs: paras })
  }

  // 7 — The honest data (Day 15)
  const d15 = a.endure_day_15
  if (d15?.status) {
    const statusLine = {
      no_close_calls: `By Day 15 you had no close calls — the urge had stayed manageable. That is data, not a guarantee.`,
      close_calls_held: `By Day 15 you had close calls and held through each one. The vow stayed intact.`,
      one_close_call: `By Day 15 you had one specific close call. You held.`,
      slipped_once: `By Day 15 you had slipped once, and used the path you built on Day 4. The slip stayed a slip.`,
      slipped_more_than_once: `By Day 15 there had been more than one slip — and you were continuing the work anyway. That continuation is what matters.`,
    }[d15.status] || ''
    const paras = [statusLine]
    const linkWord = { situation: 'the situation you were in', state: 'the state underneath', thought: 'the thought that gave permission', urge: 'the urge itself' }[d15.catchable_link]
    if (linkWord) paras.push(`Tracing one real moment, the earliest place it could have broken was ${linkWord}. Seeing the link is the leverage.`)
    sections.push({ heading: 'The honest data', paragraphs: paras })
  }

  // 8 — What you value (Day 19)
  const d19 = a.endure_day_19
  if (d19?.ranked_top_5?.length > 0) {
    const top3 = d19.ranked_top_5.slice(0, 3).map(v => v.label.split('—')[0].trim().toLowerCase()).join(', ')
    const paras = [`On Day 19 you ranked your values. The top three: ${top3}.`]
    if (d19.crowded_out_label) paras.push(`The substance had crowded out ${d19.crowded_out_label.split('—')[0].trim().toLowerCase()} most of all.`)
    if (d19.enact_action) paras.push(`And you gave one of them a move this week, in your own words: "${d19.enact_action}"${d19.enact_when ? `, ${d19.enact_when}` : ''}.`)
    paras.push(`These are the directions the work walks toward now — the things you would not trade.`)
    sections.push({ heading: 'What you value', paragraphs: paras })
  }

  // Closing
  sections.push({
    heading: 'Who you are now',
    paragraphs: [
      `You are not the substance. You are not the absence of it. You are the person who walked twenty days — who named what was underneath, built the path, dismantled the shame, mapped the ground, and held the vow.`,
      `That person is who reads this. That person is who you became through the doing.`,
    ],
  })

  return sections
}

// ----- helpers -----
function stateLabel(id) {
  return {
    settled: 'settled', wound_up: 'wound up', shut_down: 'shut down',
    ventral: 'settled', sympathetic: 'wound up', dorsal: 'shut down',
  }[id] || id
}
function capitalLabel(key) {
  return { physical: 'Physical and material capital', human: 'Human capital', social: 'Social capital', cultural: 'Cultural capital' }[key] || key
}
function findLowestCapital(scores) {
  let k = null, v = Infinity
  Object.entries(scores || {}).forEach(([key, val]) => { if (val < v) { v = val; k = key } })
  return k
}
function findHighestCapital(scores) {
  let k = null, v = -Infinity
  Object.entries(scores || {}).forEach(([key, val]) => { if (val > v) { v = val; k = key } })
  return k
}

const S = {
  container: { padding: 0 },
  eyebrow: { fontSize: '11px', color: '#A8946F', textTransform: 'uppercase', letterSpacing: '0.18em', fontFamily: 'Georgia, serif', margin: '0 0 0.75rem' },
  eyebrowC: { fontSize: '11px', color: '#A8946F', textTransform: 'uppercase', letterSpacing: '0.18em', fontFamily: 'Georgia, serif', margin: '0 0 0.9rem' },
  prompt: { fontSize: '20px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.32, margin: '0 0 0.6rem' },
  composeTitle: { fontSize: '27px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 600, lineHeight: 1.25, margin: '0 0 1.3rem' },
  composeText: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.72, margin: '0 auto 1.1rem', maxWidth: '350px' },
  composeItalic: { fontSize: '13.5px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, margin: '0 auto', maxWidth: '300px' },
  composeMissing: { fontSize: '11.5px', color: '#A8946F', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '1.4rem auto 0', lineHeight: 1.5, maxWidth: '320px' },
  portraitTitle: { fontSize: '30px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 600, lineHeight: 1.2, margin: '0 0 0.7rem' },
  portraitSubtext: { fontSize: '14px', color: '#8A7355', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.5, margin: '0 0 1rem' },
  ornament: { fontSize: '14px', color: '#C9A86F', letterSpacing: '0.5em', textAlign: 'center' },
  sectionHeading: { fontSize: '13px', color: '#854F0B', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 600, margin: '0 0 0.9rem', paddingTop: '1.1rem', borderTop: '0.5px solid #EADFCB', textAlign: 'center' },
  paragraph: { fontSize: '16px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.82, margin: '0 0 1.15rem' },
  optList: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '0.85rem' },
  opt: { textAlign: 'left', padding: '13px 15px', borderRadius: '11px', border: '0.5px solid #E0D5C2', background: '#FDFBF6', color: '#3A2D1E', fontSize: '14px', fontFamily: 'Georgia, serif', cursor: 'pointer', lineHeight: 1.4 },
  optOn: { border: '1.5px solid #8A5A1A', background: 'linear-gradient(180deg, #FBF1DF 0%, #F4E7CE 100%)', color: '#5A3A0E', fontWeight: 600 },
  footer: { display: 'flex', gap: '10px', marginTop: '1.75rem' },
  primaryBtn: { width: '100%', padding: '14px', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', border: 'none', borderRadius: '12px', fontSize: '15px', fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 2px 8px rgba(110,68,16,0.25)' },
  primaryBtnFlex: { flex: 1, padding: '14px', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', border: 'none', borderRadius: '12px', fontSize: '15px', fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 2px 8px rgba(110,68,16,0.25)' },
  secondaryBtn: { padding: '14px 20px', background: 'transparent', color: '#8A7355', border: '0.5px solid #D9C9B0', borderRadius: '12px', fontSize: '14px', fontFamily: 'Georgia, serif', cursor: 'pointer' },
  disabled: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
}
