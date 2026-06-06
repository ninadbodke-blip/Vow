import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'

// DAY 11 (first) + DAY 17 (second) — "The replacement engine"
// A vitality DIAL per activity instead of a status menu: tap how alive the
// practice is, on an ordered gauge. On the second check the dial shows the
// Day-11 reading as a ghost marker with a movement arrow, and the review
// reads the aggregate (engine running / needs fuel). Data layer (Supabase
// pull from commit_day_4, prior-check load) is preserved exactly; the saved
// check_data shape is unchanged. (type: 'replacementEngineCheck')
export default function ReplacementEngineCheck({ data, onSave, saving }) {
  const {
    version = 'first',
    pullFromArtifact = 'commit_day_4',
    pullPriorCheck,
    engineTeach = [],
    dialPrompt,
    statusOptions,
    difficultyPrompt,
    difficultyOptions,
    adjustmentPrompt,
    adjustmentOptions,
    whatChangedPrompt,
    whatChangedOptions = [],
    freshStatusOptions,
    freshDifficultyOptions,
    freshAdjustmentOptions,
    freshAddPrompt,
    freshAddSubtext,
    priorStatusOptions = [],
    priorFreshStatusOptions = [],
  } = data

  const isSecondCheck = version === 'second'

  const [loadingState, setLoadingState] = useState('loading')
  const [committedActivities, setCommittedActivities] = useState([])
  const [source, setSource] = useState('commit')
  const [freshInput, setFreshInput] = useState('')
  const [priorCheckData, setPriorCheckData] = useState(null)

  // Per-activity entries: { activityId: { status, difficulty, adjustment, whatChanged } }
  const [entries, setEntries] = useState({})
  const [phase, setPhase] = useState('load')
  const [activeIdx, setActiveIdx] = useState(0)

  // ---- DATA LAYER (preserved) ----
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoadingState('no_user'); return }

      const { data: commitArtifact } = await supabase
        .from('vow_artifacts').select('content')
        .eq('user_id', user.id).eq('artifact_type', pullFromArtifact).maybeSingle()

      if (!commitArtifact?.content?.committed_activities) {
        setSource('fresh'); setLoadingState('ready'); setPhase('teach'); return
      }
      setCommittedActivities(commitArtifact.content.committed_activities)

      if (isSecondCheck && pullPriorCheck) {
        const { data: priorArtifact } = await supabase
          .from('vow_artifacts').select('content')
          .eq('user_id', user.id).eq('artifact_type', pullPriorCheck).maybeSingle()
        if (priorArtifact?.content) setPriorCheckData(priorArtifact.content)
      }
      setLoadingState('ready'); setPhase('teach')
    }
    load()
  }, [pullFromArtifact, pullPriorCheck, isSecondCheck])

  const statusOpts = source === 'fresh' ? (freshStatusOptions || statusOptions) : statusOptions
  const difficultyOpts = source === 'fresh' ? (freshDifficultyOptions || difficultyOptions) : difficultyOptions
  const adjustmentOpts = source === 'fresh' ? (freshAdjustmentOptions || adjustmentOptions) : adjustmentOptions

  const addFresh = () => {
    const t = freshInput.trim()
    if (!t || committedActivities.length >= 3) return
    if (committedActivities.some(a => a.label.toLowerCase() === t.toLowerCase())) { setFreshInput(''); return }
    setCommittedActivities(prev => [...prev, { activity: `fresh_${prev.length}_${Date.now()}`, label: t, frequency: null, duration: null, is_fresh: true }])
    setFreshInput('')
  }
  const removeFresh = (aid) => setCommittedActivities(prev => prev.filter(a => a.activity !== aid))
  const updateEntry = (activityId, field, value) => setEntries(prev => ({ ...prev, [activityId]: { ...(prev[activityId] || {}), [field]: value } }))
  const openActivity = (idx) => { setActiveIdx(idx); setPhase(`activity:${idx}`) }
  const closeActivity = () => setPhase('list')

  const entryDone = (e) => isSecondCheck ? (e?.status && e?.whatChanged) : (e?.status && e?.adjustment)
  const allEntriesComplete = committedActivities.every((a, idx) => entryDone(entries[a.activity || `idx_${idx}`]))

  const finalize = () => {
    const checkData = committedActivities.map((activity, idx) => {
      const id = activity.activity || `idx_${idx}`
      const entry = entries[id] || {}
      return {
        activity_id: id,
        activity_label: activity.label,
        committed_frequency: activity.frequency,
        committed_duration: activity.duration,
        status: entry.status,
        difficulty: entry.difficulty,
        adjustment: entry.adjustment,
        what_changed: entry.whatChanged,
      }
    })
    onSave({ version, source, check_data: checkData, checked_at: new Date().toISOString() })
  }

  // ---- dial helpers ----
  const dialOpts = (statusOpts || []).filter(o => !o.off).slice().sort((a, b) => (b.rank || 0) - (a.rank || 0))
  const rankOf = (opts, id) => { const o = (opts || []).find(x => x.id === id); return o ? (o.rank ?? null) : null }
  const priorResolve = (pid) => {
    const set = [...priorStatusOptions, ...priorFreshStatusOptions]
    const o = set.find(x => x.id === pid)
    return { label: o?.label || pid, rank: o?.rank ?? null }
  }

  // ===================== LOADING =====================
  if (loadingState === 'loading') {
    return <div style={{ ...S.container, textAlign: 'center', padding: '3rem 1rem' }}><p style={{ color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>Loading your replacement engine…</p></div>
  }

  // ===================== TEACH =====================
  if (phase === 'teach') {
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>{isSecondCheck ? 'Day 17 · Engine, second check' : 'Day 11 · The replacement engine'}</p>
        <h2 style={S.prompt}>{isSecondCheck ? 'A week on — is it running?' : "You don't subtract a habit. You replace its job."}</h2>
        {engineTeach.map((t, i) => (
          <p key={i} style={{ ...S.body, marginBottom: i === engineTeach.length - 1 ? '0.5rem' : '0.85rem' }}>{t}</p>
        ))}
        <div style={S.footer}>
          <button onClick={() => setPhase(source === 'fresh' ? 'collect' : 'list')} style={S.primaryBtn}>{source === 'fresh' ? 'Name what you reach for ›' : 'Check the engine ›'}</button>
        </div>
      </div>
    )
  }

  // ===================== COLLECT (fresh) =====================
  if (phase === 'collect') {
    return (
      <div style={S.container}>
        <h2 style={S.prompt}>{freshAddPrompt || 'What have you been reaching for?'}</h2>
        <p style={S.hint}>{freshAddSubtext || "One to three things you've actually been doing instead. They don't have to be impressive. Just honest."}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', margin: '0.9rem 0' }}>
          {committedActivities.map(a => (
            <span key={a.activity} style={{ fontSize: '13px', color: '#5A3A0E', background: 'linear-gradient(180deg, #FBF1DF 0%, #F4E7CE 100%)', border: '1px solid #D9B57A', borderRadius: '20px', padding: '6px 12px', fontFamily: 'Georgia, serif' }}>
              {a.label} <span onClick={() => removeFresh(a.activity)} style={{ cursor: 'pointer', opacity: 0.55, marginLeft: '3px' }}>×</span>
            </span>
          ))}
        </div>
        {committedActivities.length < 3 && (
          <div style={{ display: 'flex', gap: '7px' }}>
            <input value={freshInput} onChange={e => setFreshInput(e.target.value)} placeholder="e.g. walking, the gym, tea, calling someone" style={{ ...S.input, marginTop: 0, flex: 1 }} onKeyDown={e => { if (e.key === 'Enter') addFresh() }} maxLength={50} />
            <button onClick={addFresh} disabled={!freshInput.trim()} style={{ ...S.secondaryBtn, padding: '12px 16px', opacity: freshInput.trim() ? 1 : 0.4 }}>Add</button>
          </div>
        )}
        <div style={S.footer}>
          <button onClick={() => setPhase('list')} disabled={committedActivities.length === 0} style={{ ...S.primaryBtn, ...(committedActivities.length === 0 ? S.disabled : {}) }}>{committedActivities.length === 0 ? 'Add at least one' : 'Continue ›'}</button>
        </div>
      </div>
    )
  }

  // ===================== LIST =====================
  if (phase === 'list') {
    const doneCount = committedActivities.filter((a, idx) => entryDone(entries[a.activity || `idx_${idx}`])).length
    return (
      <div style={S.container}>
        <p style={S.eyebrow}>{isSecondCheck ? 'Before and now' : 'Your engine'}</p>
        <h2 style={S.prompt}>{source === 'fresh' ? "What you've been reaching for." : 'Your replacement activities.'}</h2>
        <p style={S.hint}>Tap into each one and set how alive it is right now.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginTop: '1rem' }}>
          {committedActivities.map((activity, idx) => {
            const id = activity.activity || `idx_${idx}`
            const entry = entries[id]
            const done = entryDone(entry)
            const curLabel = entry?.status ? ((statusOpts.find(o => o.id === entry.status) || {}).label) : null
            return (
              <button key={id} onClick={() => openActivity(idx)} style={{ ...S.row, ...(done ? S.rowDone : {}) }}>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif', margin: '0 0 2px' }}>{activity.label}</p>
                  {curLabel
                    ? <p style={{ fontSize: '12.5px', color: '#7A3A12', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0 }}>{curLabel}</p>
                    : <p style={{ fontSize: '12px', color: '#A8946F', fontFamily: 'Georgia, serif', margin: 0 }}>{activity.frequency ? `Committed: ${activity.frequency}, ${activity.duration}` : 'Tap to set'}</p>}
                </div>
                <span style={{ fontSize: '18px', color: done ? '#7A8C5A' : '#C9A86F', marginLeft: '10px' }}>{done ? '✓' : '›'}</span>
              </button>
            )
          })}
        </div>
        <div style={S.footer}>
          <button onClick={() => setPhase('teach')} style={S.secondaryBtn}>‹ Back</button>
          <button onClick={() => setPhase('review')} disabled={!allEntriesComplete} style={{ ...S.primaryBtnFlex, ...(!allEntriesComplete ? S.disabled : {}) }}>{doneCount} of {committedActivities.length} · Review</button>
        </div>
      </div>
    )
  }

  // ===================== ACTIVITY (dial) =====================
  if (phase.startsWith('activity:')) {
    const activity = committedActivities[activeIdx]
    const id = activity.activity || `idx_${activeIdx}`
    const entry = entries[id] || {}
    let prior = null
    if (isSecondCheck && priorCheckData?.check_data) {
      const pe = priorCheckData.check_data.find(c => c.activity_id === id)
      if (pe?.status) prior = priorResolve(pe.status)
    }
    const curRank = entry.status ? rankOf(statusOpts, entry.status) : null
    const sideOpts = (statusOpts || []).filter(o => o.off)
    let delta = null
    if (curRank != null && prior && prior.rank != null) delta = curRank - prior.rank
    const deltaBadge = delta == null ? null
      : delta > 0 ? { t: '↑ stronger than Day 11', c: '#5E7040', bg: '#EDF1E2' }
      : delta < 0 ? { t: '↓ slipped since Day 11', c: '#B2541F', bg: '#FAEBE1' }
      : { t: '→ held since Day 11', c: '#8A6A3A', bg: '#F4ECDD' }

    const done = entryDone(entry)
    return (
      <div style={S.container}>
        <button onClick={closeActivity} style={{ ...S.secondaryBtn, padding: '6px 0', border: 'none', color: '#A8946F', marginBottom: '0.5rem' }}>‹ All activities</button>
        <h2 style={{ ...S.prompt, marginBottom: '0.2rem' }}>{activity.label}</h2>
        <p style={S.hint}>{activity.frequency ? `Committed: ${activity.frequency}, ${activity.duration}` : "Something you've been reaching for"}</p>
        {deltaBadge && <span style={{ display: 'inline-block', marginTop: '8px', fontSize: '12px', fontWeight: 600, color: deltaBadge.c, background: deltaBadge.bg, borderRadius: '20px', padding: '4px 12px', fontFamily: 'Georgia, serif' }}>{deltaBadge.t}</span>}

        {/* DIAL */}
        <p style={{ ...S.groupLabel, marginTop: '1.3rem' }}>{dialPrompt || 'How alive is this practice right now?'}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {dialOpts.map(o => {
            const filled = curRank != null && (o.rank || 0) <= curRank
            const selected = entry.status === o.id
            const isPrior = prior && prior.rank === o.rank
            return (
              <button key={o.id} onClick={() => updateEntry(id, 'status', o.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '11px', textAlign: 'left', width: '100%',
                  padding: '11px 14px', borderRadius: '11px', cursor: 'pointer',
                  border: selected ? '1.5px solid #8A5A1A' : '0.5px solid #E0D5C2',
                  background: filled ? 'linear-gradient(90deg, #F4E7CE 0%, #FBF1DF 100%)' : '#FDFBF6',
                  transition: 'all .12s',
                }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, background: filled ? '#9A6A2A' : '#DACBB2' }} />
                <span style={{ flex: 1, fontSize: '13.5px', color: filled ? '#5A3A0E' : '#6B5840', fontWeight: selected ? 600 : 400, fontFamily: 'Georgia, serif', lineHeight: 1.35 }}>{o.label}</span>
                {isPrior && <span style={{ fontSize: '10px', color: '#8A7355', fontFamily: 'Georgia, serif', fontStyle: 'italic', whiteSpace: 'nowrap' }}>Day 11 ◂</span>}
              </button>
            )
          })}
        </div>
        {sideOpts.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            {sideOpts.map(o => {
              const selected = entry.status === o.id
              return <button key={o.id} onClick={() => updateEntry(id, 'status', o.id)} style={{ ...S.opt, ...(selected ? S.optOn : {}), fontSize: '13px' }}>{o.label}</button>
            })}
          </div>
        )}

        {/* FOLLOW-UP */}
        {!isSecondCheck && entry.status && (
          <>
            <p style={{ ...S.groupLabel, marginTop: '1.4rem' }}>{difficultyPrompt}</p>
            <div style={S.optList}>
              {(difficultyOpts || []).map(o => <button key={o.id} onClick={() => updateEntry(id, 'difficulty', o.id)} style={{ ...S.opt, ...(entry.difficulty === o.id ? S.optOn : {}) }}>{o.label}</button>)}
            </div>
            <p style={{ ...S.groupLabel, marginTop: '1.3rem' }}>{adjustmentPrompt}</p>
            <div style={S.optList}>
              {(adjustmentOpts || []).map(o => <button key={o.id} onClick={() => updateEntry(id, 'adjustment', o.id)} style={{ ...S.opt, ...(entry.adjustment === o.id ? S.optOn : {}) }}>{o.label}</button>)}
            </div>
          </>
        )}
        {isSecondCheck && entry.status && (
          <>
            <p style={{ ...S.groupLabel, marginTop: '1.4rem' }}>{whatChangedPrompt}</p>
            <div style={S.optList}>
              {whatChangedOptions.map(o => <button key={o.id} onClick={() => updateEntry(id, 'whatChanged', o.id)} style={{ ...S.opt, ...(entry.whatChanged === o.id ? S.optOn : {}) }}>{o.label}</button>)}
            </div>
          </>
        )}

        <div style={S.footer}>
          <button onClick={closeActivity} disabled={!done} style={{ ...S.primaryBtnFlex, ...(!done ? S.disabled : {}) }}>Done with this one ›</button>
        </div>
      </div>
    )
  }

  // ===================== REVIEW =====================
  // aggregate movement (second check)
  let aggLine = isSecondCheck ? 'A week of data. Adjustment is the work — not perfect execution.' : 'Adjustment is part of the work. The point is the engine keeps running.'
  if (isSecondCheck && priorCheckData?.check_data) {
    let up = 0, down = 0, held = 0, n = 0
    committedActivities.forEach((a, idx) => {
      const id = a.activity || `idx_${idx}`
      const cr = rankOf(statusOpts, (entries[id] || {}).status)
      const pe = priorCheckData.check_data.find(c => c.activity_id === id)
      const pr = pe ? priorResolve(pe.status).rank : null
      if (cr != null && pr != null) { n++; if (cr > pr) up++; else if (cr < pr) down++; else held++ }
    })
    if (n > 0) {
      if (up >= down && up > 0) aggLine = `The engine is running. ${up} of ${n} ${up === 1 ? 'practice has' : 'practices have'} more life in ${up === 1 ? 'it' : 'them'} than a week ago — that is the flatness lifting and the groove deepening.`
      else if (down > up) aggLine = `Some of the engine has stalled — ${down} of ${n} faded this week. That is information, not failure. The next move is to shrink or swap what is not holding, so it actually happens.`
      else aggLine = `The engine held steady this week. Holding, early on, is its own kind of progress — the practice is becoming routine.`
    }
  }

  return (
    <div style={S.container}>
      <p style={S.eyebrow}>{isSecondCheck ? 'A week on' : 'Engine check'}</p>
      <h2 style={S.prompt}>{isSecondCheck ? 'What moved.' : 'The engine, checked.'}</h2>
      <div style={{ ...S.card, borderLeft: '3px solid #854F0B', padding: '14px 16px', margin: '0.6rem 0 1.1rem' }}>
        <p style={{ fontSize: '14.5px', color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.6, margin: 0 }}>{aggLine}</p>
      </div>

      {committedActivities.map((activity, idx) => {
        const id = activity.activity || `idx_${idx}`
        const entry = entries[id] || {}
        const curLabel = (statusOpts.find(o => o.id === entry.status) || {}).label
        let priorLabel = null
        if (isSecondCheck && priorCheckData?.check_data) {
          const pe = priorCheckData.check_data.find(c => c.activity_id === id)
          if (pe?.status) priorLabel = priorResolve(pe.status).label
        }
        const adjLabel = !isSecondCheck ? ((adjustmentOpts || []).find(o => o.id === entry.adjustment) || {}).label : (whatChangedOptions.find(o => o.id === entry.whatChanged) || {}).label
        return (
          <div key={id} style={{ ...S.reviewCard, marginBottom: '10px' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif', margin: '0 0 5px' }}>{activity.label}</p>
            {priorLabel && <p style={{ fontSize: '12px', color: '#A8946F', fontFamily: 'Georgia, serif', margin: '0 0 2px' }}>Day 11: {priorLabel}</p>}
            <p style={{ fontSize: '13.5px', color: '#7A3A12', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '0 0 3px' }}>{isSecondCheck ? 'Now: ' : ''}{curLabel}</p>
            {adjLabel && <p style={{ fontSize: '13px', color: '#5A4A36', fontFamily: 'Georgia, serif', margin: 0 }}>{isSecondCheck ? '' : '→ '}{adjLabel}</p>}
          </div>
        )
      })}

      <div style={S.footer}>
        <button onClick={() => setPhase('list')} style={S.secondaryBtn} disabled={saving}>‹ Back</button>
        <button onClick={finalize} disabled={saving} style={{ ...S.primaryBtnFlex, ...(saving ? S.disabled : {}) }}>{saving ? 'Saving…' : 'Save the check'}</button>
      </div>
    </div>
  )
}

const S = {
  container: { padding: 0 },
  eyebrow: { fontSize: '11px', color: '#A8946F', textTransform: 'uppercase', letterSpacing: '0.18em', fontFamily: 'Georgia, serif', margin: '0 0 0.75rem' },
  prompt: { fontSize: '20px', fontWeight: 600, color: '#2A1F15', fontFamily: 'Georgia, serif', lineHeight: 1.32, margin: '0 0 0.6rem' },
  body: { fontSize: '14.5px', color: '#4A3A28', fontFamily: 'Georgia, serif', lineHeight: 1.62, margin: 0 },
  hint: { fontSize: '13px', color: '#8A7355', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.5, margin: '0 0 0.25rem' },
  groupLabel: { fontSize: '11px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600, fontFamily: 'Georgia, serif', margin: '0 0 0.5rem' },
  footer: { display: 'flex', gap: '10px', marginTop: '1.75rem' },
  primaryBtn: { width: '100%', padding: '14px', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', border: 'none', borderRadius: '12px', fontSize: '15px', fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 2px 8px rgba(110,68,16,0.25)' },
  primaryBtnFlex: { flex: 1, padding: '14px', background: 'linear-gradient(180deg, #8A5A1A 0%, #6E4410 100%)', color: '#FBF6EA', border: 'none', borderRadius: '12px', fontSize: '15px', fontFamily: 'Georgia, serif', cursor: 'pointer', boxShadow: '0 2px 8px rgba(110,68,16,0.25)' },
  secondaryBtn: { padding: '14px 20px', background: 'transparent', color: '#8A7355', border: '0.5px solid #D9C9B0', borderRadius: '12px', fontSize: '14px', fontFamily: 'Georgia, serif', cursor: 'pointer' },
  disabled: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
  card: { background: 'linear-gradient(180deg, #FBF6EA 0%, #F5EEDF 100%)', borderRadius: '12px', border: '0.5px solid #EADFCB' },
  row: { display: 'flex', alignItems: 'center', padding: '13px 15px', borderRadius: '12px', border: '0.5px solid #E0D5C2', background: '#FDFBF6', cursor: 'pointer', width: '100%' },
  rowDone: { border: '1px solid #C2D0A8', background: 'linear-gradient(180deg, #F4F7EC 0%, #EEF3E1 100%)' },
  optList: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '0.2rem' },
  opt: { textAlign: 'left', padding: '12px 14px', borderRadius: '11px', border: '0.5px solid #E0D5C2', background: '#FDFBF6', color: '#3A2D1E', fontSize: '14px', fontFamily: 'Georgia, serif', cursor: 'pointer', lineHeight: 1.4, width: '100%' },
  optOn: { border: '1.5px solid #8A5A1A', background: 'linear-gradient(180deg, #FBF1DF 0%, #F4E7CE 100%)', color: '#5A3A0E', fontWeight: 600 },
  input: { width: '100%', padding: '12px 14px', border: '0.5px solid #C9A86F', borderRadius: '11px', fontSize: '14px', color: '#2A1F15', fontFamily: 'Georgia, serif', background: '#FFFDF8', outline: 'none', boxSizing: 'border-box', marginTop: '2px' },
  reviewCard: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF7EF 100%)', border: '0.5px solid #EADFCB', borderRadius: '13px', padding: '14px 16px' },
}