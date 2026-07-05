import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import BottomNav from '../../components/BottomNav'
import VowPathInvite from '../freeHome/VowPathInvite'
import OraclePool from './OraclePool'
import JournalArchive from './JournalArchive'
import CoachMark from '../../components/CoachMark'
import VowBrandMark from '../../components/VowBrandMark'
import { moodByScore, moodByValue } from '../freeHome/DailyCheckin'

// =====================================================================
// THE MIRROR — a patient, literary reflection of the longer view.
// It is NOT stage-specific: it reads every signal a person has ever
// logged and shapes them into a few designed moments, not a data dump:
//   · The Sunday Seal   — the week's reflection, revealed by ritual
//   · Oracle of Vow      — placeholder for the weekly AI reflection
//   · The week's weather — recent mood/energy/pull texture
//   · The shape of the pull       — what they've learned about the urge
//   · What you're building        — the defenses + who they're becoming
//   · The Alchemy        — a named contradiction turned into proof
//   · The Drift          — a typographic heatmap of the circling ghosts
//   · The ground held    — the streak, plainly
// Reclaim shows only the kind, clinical "Anatomy of a Fracture".
// =====================================================================

// Set to a weekday (0 = Sunday) to gate the weekly reflection to that day —
// the "Sunday ritual." null lets the seal be broken any day (pilot default).
const WEEKLY_RITUAL_DAY = null

// --- AI WEEKLY REFLECTION (Oracle of Vow) — scaffolded, OFF for pilot --------
// Flip to true ONLY after deploying a server function (Supabase Edge Function
// `weekly-reflection`, or a Vercel route) that holds the API key server-side.
// NEVER call Anthropic/OpenAI from the browser. It receives `weeklySummary`
// and returns { reflection }. When on, the Oracle card shows the real letter.
const AI_REFLECTION_ENABLED = false
async function fetchWeeklyAIReflection(weeklySummary) {
  if (!AI_REFLECTION_ENABLED) return null
  try {
    const { data, error } = await supabase.functions.invoke('weekly-reflection', { body: { weeklySummary } })
    if (error) return null
    return data?.reflection || null
  } catch { return null }
}

// notice_autopilot stores the chip INDEX (0..2) — not 1..3 as it once did.
const AUTOPILOT_IDX = { 0: 'on total autopilot', 1: 'half-awake to it', 2: 'fully conscious' }
const FRACTURES = { exhaustion: 'Exhaustion', social: 'Social — ambient pressure', emotional: 'An emotional wave', vacuum: 'The vacuum' }
const DOMAIN_LABEL = { physical: 'your body', relational: 'the people close to you', craft: 'your craft', rest: 'real rest', idle: 'open, unclaimed time' }
// WhatItCosts v3 stores the user's chosen currency; NONE/absent = bare numbers.
const CUR_SYMBOL = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }
// daily_vitals stores words, not numbers — these are the low-signal answers.
const VITAL_LOWS = new Set(['Badly', 'Not really', 'No'])

const ProfileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
)

const fmtCur = (n, code) => (CUR_SYMBOL[code] || '') + Math.round(n).toLocaleString(code === 'INR' ? 'en-IN' : 'en-US')
const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)
function mostCommon(arr) {
  const m = {}; let best = null, bc = 0
  for (const v of arr) { if (v == null || v === '') continue; m[v] = (m[v] || 0) + 1; if (m[v] > bc) { bc = m[v]; best = v } }
  return best == null ? null : [best, bc]
}

// A warm, literary read of the past week — derived from real data, never a count list.
function weeklyReflection({ ciWeek, energyAvg, urge, grew }) {
  const s = []
  if (ciWeek > 0) {
    const tone = energyAvg >= 4 ? ' — and it carried you lighter than most'
      : (energyAvg > 0 && energyAvg <= 2) ? ', and it asked a great deal of you'
        : ''
    s.push(`You met this week ${ciWeek} ${ciWeek === 1 ? 'time' : 'times'}${tone}.`)
  }
  if (urge.total > 0) {
    s.push(urge.creeps >= urge.spikes
      ? `When the pull came, it came mostly as a slow creep — the tiredness, not the fire — and you were still standing after.`
      : `The pull came sharp and sudden this week, and each time it passed without you.`)
  }
  if (grew > 0) s.push(`And you left ${grew} ${grew === 1 ? 'mark' : 'marks'} of who you're becoming.`)
  if (!s.length) return "A quiet week — little logged, and that's allowed. The Oracle keeps the longer view for whenever you return."
  return s.join(' ')
}

// --- THE SUNDAY SEAL ---------------------------------------------------------
function SundaySeal({ summary }) {
  const gated = WEEKLY_RITUAL_DAY != null && new Date().getDay() !== WEEKLY_RITUAL_DAY
  const [unlocked, setUnlocked] = useState(false)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef(null)

  const start = () => {
    if (gated || unlocked) return
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(intervalRef.current); setUnlocked(true); return 100 }
        return p + 4
      })
    }, 60)
  }
  const end = () => { if (!unlocked) { clearInterval(intervalRef.current); setProgress(0) } }
  useEffect(() => () => clearInterval(intervalRef.current), [])

  if (gated) {
    return (
      <div style={styles.vaultCard}>
        <p style={styles.sealGlyph}>🔒</p>
        <p style={styles.vaultTextItalic}>Gathering this week's evidence.<br />The Oracle unlocks on Sunday.</p>
      </div>
    )
  }
  if (unlocked) {
    return (
      <div style={{ ...styles.vaultCard, border: '1px solid rgba(217,181,122,0.28)' }}>
        <p style={styles.vaultEyebrow}>This week</p>
        <p style={styles.vaultTextRegular}>{summary}</p>
      </div>
    )
  }
  return (
    <div
      style={{ ...styles.vaultCard, position: 'relative', overflow: 'hidden', cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none' }}
      onPointerDown={start} onPointerUp={end} onPointerLeave={end}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: `${progress}%`,
        background: 'linear-gradient(90deg, rgba(133,79,11,0) 0%, rgba(217,181,122,0.18) 100%)',
        transition: 'width 0.06s linear',
      }} />
      <p style={{ ...styles.sealGlyph, position: 'relative', zIndex: 2, color: '#D9B57A' }}>✦</p>
      <p style={{ ...styles.vaultTextRegular, textAlign: 'center', position: 'relative', zIndex: 2 }}>
        This week's reflection is ready.
        <span style={styles.sealHint}>Press and hold to break the seal</span>
      </p>
    </div>
  )
}

// --- ORACLE OF VOW (weekly AI reflection — placeholder until APIs are wired) --
// NOTE: The former OracleOfVow card has been retired — its weekly-AI-reflection
// essence now surfaces inside the Oracle pool when the user drops a pebble
// (see OraclePool's reflection area). The oracle* styles below are kept unused
// for now in case the card pattern is revived.

export default function MirrorScreen() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [tracker, setTracker] = useState(null)
  const [stage, setStage] = useState(null)
  const [checkins, setCheckins] = useState([])
  const [byType, setByType] = useState({})
  const [urgeLogs, setUrgeLogs] = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  const [aiReflection, setAiReflection] = useState(null)
  const [pebbleDays, setPebbleDays] = useState([])  // ISO dates (yyyy-mm-dd) a pebble was dropped

  // ---- Guided tour (coach marks) for the Oracle tab ----
  const poolRef = useRef(null)
  const sealRef = useRef(null)
  const weatherRef = useRef(null)
  const pullRef = useRef(null)
  const builtRef = useRef(null)
  const archiveRef = useRef(null)
  const [tourOpen, setTourOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function maybeStartTour() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return
      const { data } = await supabase
        .from('vow_path_progress')
        .select('oracle_oriented')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!cancelled && data && !data.oracle_oriented) {
        setTimeout(() => { if (!cancelled) setTourOpen(true) }, 700)
      }
    }
    maybeStartTour()
    return () => { cancelled = true }
  }, [])

  const finishTour = async () => {
    setTourOpen(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('vow_path_progress').update({ oracle_oriented: true }).eq('user_id', user.id)
    }
  }
  const nowTs = Date.now()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: prof } = await supabase.from('profiles').select('first_name, full_name').eq('id', user.id).maybeSingle()
      if (prof?.first_name) setFirstName(prof.first_name)
      else if (prof?.full_name) setFirstName(prof.full_name.split(' ')[0])

      const { data: trackers } = await supabase.from('trackers')
        .select('*, addiction_types (name, icon)').eq('user_id', user.id).eq('is_active', true).order('created_at').limit(1)
      const trk = trackers && trackers[0]
      if (trk) setTracker(trk)

      const { data: vp } = await supabase.from('vow_path_progress')
        .select('free_state, substance_label').eq('user_id', user.id).maybeSingle()
      if (vp?.free_state) setStage(vp.free_state)

      const { data: ci } = await supabase.from('free_daily_checkins')
        .select('*').eq('user_id', user.id).order('checkin_date', { ascending: false }).limit(30)
      setCheckins(ci || [])

      const { data: sig } = await supabase.from('free_stage_signals')
        .select('signal_type, payload, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(400)
      const grouped = {}
      ;(sig || []).forEach(r => { if (!grouped[r.signal_type]) grouped[r.signal_type] = []; grouped[r.signal_type].push(r) })
      setByType(grouped)

      // The revamped tools write two tables beyond free_stage_signals:
      // the urge flow logs rides in urge_logs, and "Instead, I…" logs
      // mood-lift entries in free_activity_logs. Both read-only here.
      const { data: ul } = await supabase.from('urge_logs')
        .select('intensity, triggers, resisted, duration_seconds, technique_used, technique_helped, created_at')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(200)
      setUrgeLogs(ul || [])
      const { data: al } = await supabase.from('free_activity_logs')
        .select('activity_type, mood_before, mood_after, created_at')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(200)
      setActivityLogs(al || [])

      // Oracle pebbles: stored as free_stage_signals rows of type 'oracle_pebble',
      // one per day. We keep the set of distinct dates a pebble was dropped.
      const pebbleRows = (grouped['oracle_pebble'] || [])
      const days = Array.from(new Set(pebbleRows.map(r => new Date(r.created_at).toISOString().slice(0, 10))))
      setPebbleDays(days)

      if (AI_REFLECTION_ENABLED) {
        const r = await fetchWeeklyAIReflection({ grouped, checkins: ci || [], tracker: trk, stage: vp?.free_state })
        setAiReflection(r)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div style={styles.frame}><div style={styles.phone}><p style={styles.loading}>Looking back…</p><BottomNav /></div></div>
  }

  // ---- derive ----
  const g = (t) => byType[t] || []
  const weekAgo = nowTs - 7 * 86400000
  const within7 = (rows) => rows.filter(r => new Date(r.created_at).getTime() >= weekAgo)
  const weekAgoStr = new Date(weekAgo).toISOString().slice(0, 10)
  const isReclaim = stage === 'reclaim'

  const daysFree = tracker ? Math.max(0, Math.floor((nowTs - new Date(tracker.start_date).getTime()) / 86400000)) : null
  const longestDays = tracker?.longest_streak_seconds ? Math.floor(tracker.longest_streak_seconds / 86400) : null
  const resets = tracker?.total_resets ?? null

  const ciWeek = checkins.filter(c => c.checkin_date >= weekAgoStr)

  // ---- Oracle pool: clarity earned by tending; pebbles dropped per day ----
  const todayStr = new Date().toISOString().slice(0, 10)
  const daysTended = Math.min(7, ciWeek.length)
  const poolClarity = Math.round((daysTended / 7) * 100)
  const pebbleDaysThisWeek = pebbleDays.filter(d => d >= weekAgoStr)
  const pebbleCount = Math.min(7, pebbleDaysThisWeek.length)
  const pebbleToday = pebbleDays.includes(todayStr)

  const dropPebble = async () => {
    if (pebbleToday) return
    // optimistic: mark today immediately so the shore fills and insight surfaces
    setPebbleDays(prev => prev.includes(todayStr) ? prev : [todayStr, ...prev])
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('free_stage_signals').insert({
        user_id: user.id,
        signal_type: 'oracle_pebble',
        payload: { date: todayStr },
      })
    } catch {
      // if the write fails, the optimistic mark still gives a calm in-session experience;
      // it will reconcile on next load.
    }
  }
  const strip = checkins.slice(0, 7).reverse()
  const energyAvg = avg(ciWeek.map(c => c.energy).filter(v => v != null))
  const pullDays = ciWeek.filter(c => c.felt_pull).length

  const urges = g('urge_velocity')
  const urge = { total: urges.length, spikes: urges.filter(u => u.payload?.velocity === 'spike').length, creeps: urges.filter(u => u.payload?.velocity === 'creep').length }

  const grewWeek = within7(g('build_evidence')).length + within7(g('journal')).length
  const summary = aiReflection || weeklyReflection({
    ciWeek: ciWeek.length, energyAvg,
    urge: {
      total: within7(urges).length,
      spikes: urges.filter(u => u.payload?.velocity === 'spike' && new Date(u.created_at).getTime() >= weekAgo).length,
      creeps: urges.filter(u => u.payload?.velocity === 'creep' && new Date(u.created_at).getTime() >= weekAgo).length,
    }, grew: grewWeek,
  })

  // ---- PORTRAIT A — the shape of the pull ------------------------------
  // Reads the CURRENT contracts: notice_context {location, company,
  // time_of_day}, notice_roi {after}, notice_autopilot {level: 0..2},
  // notice_catch {count}, reflect_cost v3 {daily_cost, daily_hours,
  // currency, first_measured}, reflect_rationalization {lies[], loudest},
  // plus urge_logs (ridden, triggers, techniques).
  const ctxLoc = mostCommon(g('notice_context').map(r => r.payload?.location))
  const ctxCompany = mostCommon(g('notice_context').map(r => r.payload?.company))
  const ctxTime = mostCommon(g('notice_context').map(r => r.payload?.time_of_day))
  const roiAfter = mostCommon(g('notice_roi').map(r => r.payload?.after))
  const apLvls = g('notice_autopilot').map(r => Number(r.payload?.level)).filter(v => Number.isFinite(v))
  const apAvg = apLvls.length ? AUTOPILOT_IDX[Math.max(0, Math.min(2, Math.round(avg(apLvls))))] : null
  const catches = g('notice_catch').reduce((a, r) => a + (Number(r.payload?.count) || 0), 0)

  // The live meter, in the user's own currency (bare number if none chosen).
  const cost = g('reflect_cost')[0]?.payload
  const meterDays = cost?.first_measured ? Math.max(0, (nowTs - new Date(cost.first_measured).getTime()) / 86400000) : null
  const meterMoney = (meterDays != null && cost?.daily_cost) ? cost.daily_cost * meterDays : null
  const meterHours = (meterDays != null && cost?.daily_hours) ? Math.round(cost.daily_hours * meterDays) : null

  const lies = new Set(g('reflect_rationalization').flatMap(r => r.payload?.lies || []))
  const loudestLie = mostCommon(g('reflect_rationalization').map(r => r.payload?.loudest))

  const urgesRidden = urgeLogs.filter(r => r.resisted).length
  const topTrigger = mostCommon(urgeLogs.flatMap(r => Array.isArray(r.triggers) ? r.triggers : []))
  const topTechnique = mostCommon(urgeLogs.filter(r => r.technique_helped && r.technique_used).map(r => r.technique_used))

  const pullLines = []
  if (ctxTime || ctxLoc) {
    const door = [ctxTime && ctxTime[0].toLowerCase(), ctxLoc && ctxLoc[0], ctxCompany && ctxCompany[0]].filter(Boolean).join(' · ')
    pullLines.push(`Its favorite door, by your own logs: ${door}.`)
  }
  if (topTrigger) pullLines.push(`What opens that door most often is ${String(topTrigger[0]).toLowerCase()}.`)
  if (roiAfter) pullLines.push(`When it fades, what it leaves behind is ${roiAfter[0]} — never the promise it made.`)
  if (apAvg && pullLines.length < 3) pullLines.push(`It tends to arrive while you are ${apAvg}.`)
  if (loudestLie && pullLines.length < 4) pullLines.push(`The lie that shouts loudest: \u201c${loudestLie[0]}\u201d`)

  const pullChips = []
  if (meterMoney != null && meterMoney >= 1) pullChips.push({ v: fmtCur(meterMoney, cost?.currency), l: 'counted by the meter' })
  else if (meterHours) pullChips.push({ v: meterHours + 'h', l: 'counted by the meter' })
  if (urgesRidden) pullChips.push({ v: urgesRidden, l: urgesRidden === 1 ? 'urge ridden out' : 'urges ridden out' })
  if (catches) pullChips.push({ v: catches, l: 'caught mid-reach' })
  if (lies.size) pullChips.push({ v: lies.size, l: lies.size === 1 ? 'lie named' : 'lies named' })
  const hasPull = pullLines.length > 0 || pullChips.length > 0

  // ---- PORTRAIT B — what you're building --------------------------------
  // commit_vow {text}, commit_confidence {score}, commit_rehearsal {move},
  // commit_fear (count), build_pillars {pillars[], high_stress},
  // build_allocation {physical..idle} summed across rows, build_evidence,
  // daily_steady (count), endure_hard_hour {outcome}, endure_recommit,
  // free_activity_logs (top mood-lift).
  const vow = g('commit_vow')[0]?.payload?.text
  const conf = g('commit_confidence')[0]?.payload?.score
  const rehearsals = g('commit_rehearsal')
  const rehearsedMove = rehearsals[0]?.payload?.move
  const worriesAnswered = g('commit_fear').length
  const pillarsHeld = g('build_pillars').filter(r => r.payload?.high_stress).length
  const topPillar = mostCommon(g('build_pillars').flatMap(r => Array.isArray(r.payload?.pillars) ? r.payload.pillars : []))
  const allocSums = { physical: 0, relational: 0, craft: 0, rest: 0 }
  g('build_allocation').forEach(r => {
    Object.keys(allocSums).forEach(d => { const v = Number(r.payload?.[d]); if (Number.isFinite(v)) allocSums[d] += v })
  })
  const topDomainKey = Object.keys(allocSums).reduce((b, d) => (allocSums[d] > (allocSums[b] || 0) ? d : b), null)
  const topDomain = topDomainKey && allocSums[topDomainKey] > 0 ? DOMAIN_LABEL[topDomainKey] : null
  const builtMarks = g('build_evidence').length + g('journal').length
  const steadyCount = g('daily_steady').length
  const hardHoursClosed = g('endure_hard_hour').filter(r => r.payload?.outcome).length
  const recommits = g('endure_recommit').length

  // "Instead, I…" — the activity that lifts mood most, by their own numbers.
  const liftByType = {}
  activityLogs.forEach(l => {
    if (l.mood_before == null || l.mood_after == null) return
    if (!liftByType[l.activity_type]) liftByType[l.activity_type] = { sum: 0, n: 0 }
    liftByType[l.activity_type].sum += (l.mood_after - l.mood_before)
    liftByType[l.activity_type].n += 1
  })
  let topLift = null
  Object.entries(liftByType).forEach(([t, { sum, n }]) => {
    const m = sum / n
    if (n >= 2 && (!topLift || m > topLift.m)) topLift = { t, m }
  })
  const topLiftLabel = topLift ? String(topLift.t).replace(/_/g, ' ') : null

  const builtLines = []
  if (vow) builtLines.push({ kind: 'vow', text: vow })
  if (rehearsedMove) builtLines.push({ kind: 'plain', text: `Your rehearsed move for the hard moment: \u201c${rehearsedMove}\u201d` })
  if (topPillar) builtLines.push({ kind: 'plain', text: `When the stress is real, what holds you up is ${String(topPillar[0]).toLowerCase()}.` })
  if (topDomain) builtLines.push({ kind: 'plain', text: `Your reclaimed hours are going, most of all, to ${topDomain}.` })
  if (topLiftLabel) builtLines.push({ kind: 'plain', text: `By your own numbers, what lifts you most is ${topLiftLabel}.` })
  if (topTechnique && builtLines.length < 5) builtLines.push({ kind: 'plain', text: `In the hardest minutes, ${String(topTechnique[0]).toLowerCase()} has been the tool that worked.` })

  const builtChipsAll = []
  if (rehearsals.length) builtChipsAll.push({ v: rehearsals.length, l: rehearsals.length === 1 ? 'rehearsal run' : 'rehearsals run' })
  if (steadyCount) builtChipsAll.push({ v: steadyCount, l: steadyCount === 1 ? 'steady minute' : 'steady minutes' })
  if (hardHoursClosed) builtChipsAll.push({ v: hardHoursClosed, l: hardHoursClosed === 1 ? 'hard hour met' : 'hard hours met' })
  if (pillarsHeld) builtChipsAll.push({ v: pillarsHeld, l: pillarsHeld === 1 ? 'time held under load' : 'times held under load' })
  if (builtMarks) builtChipsAll.push({ v: builtMarks, l: builtMarks === 1 ? 'mark of becoming' : 'marks of becoming' })
  if (recommits) builtChipsAll.push({ v: recommits, l: recommits === 1 ? 'vow renewed' : 'vow renewals' })
  if (worriesAnswered) builtChipsAll.push({ v: worriesAnswered, l: worriesAnswered === 1 ? 'worry answered' : 'worries answered' })
  if (conf != null) builtChipsAll.push({ v: conf + '/10', l: 'self-trust' })
  const builtChips = builtChipsAll.slice(0, 4)
  const hasBuilt = builtLines.length > 0 || builtChips.length > 0

  // ---- The Alchemy — contradiction into proof (contracts unchanged) -----
  const dissonance = g('reflect_dissonance')[0]?.payload
  const evidence = g('build_evidence').find(r => r.payload?.proof || r.payload?.text)?.payload
  const evidenceText = evidence?.proof || evidence?.text || null

  // ---- The map — confidence vs guard (replaces the retired ghost drift) --
  // build_drift {confidence 0..100, exposure 0..100}: high confidence with a
  // dropping guard is the classic month-two blind spot the tool watches for.
  const driftRows = g('build_drift')
  const driftLatest = driftRows[0]?.payload
  let mapLine = null
  if (driftLatest && Number.isFinite(Number(driftLatest.confidence))) {
    const c = Number(driftLatest.confidence), e = Number(driftLatest.exposure) || 0
    if (c >= 60 && e <= 40) mapLine = 'Confidence high, guard drifting low — the classic month-two blind spot. Worth one honest look.'
    else if (c >= 60 && e > 40) mapLine = 'Confidence high — and your guard is still up. That pairing is the strong quadrant.'
    else if (c < 60 && e > 40) mapLine = 'Guard up, confidence still gathering. Careful is not the same as fragile.'
    else mapLine = 'Both readings low lately. Gentler days are allowed; keep the map honest.'
  }

  // ---- Reclaim — fracture (legacy, guarded) + the gentle inventory -------
  const fr = g('reclaim_return')[0]?.payload
  const fractureReason = fr ? (FRACTURES[fr.fracture_type] || fr.fracture_type) : null
  const sleepRaw = g('daily_vitals')[0]?.payload?.sleep
  const sleepStr = sleepRaw == null ? null : String(sleepRaw)
  const topNeed = mostCommon(g('reclaim_need').flatMap(r => Array.isArray(r.payload?.needs) ? r.payload.needs : []))
  const shieldsRaised = g('reclaim_shield').length
  const topWindow = mostCommon(g('reclaim_shield').map(r => r.payload?.window))
  const standsLatest = g('reclaim_stands')[0]?.payload?.kept
  const kinderLetters = g('reclaim_kinder').length

  // The week's texture add-ons: word-based vitals + steady minutes.
  const vitals7 = within7(g('daily_vitals'))
  const lowDays7 = vitals7.filter(r => ['sleep', 'food', 'movement'].some(k => VITAL_LOWS.has(r.payload?.[k]))).length
  const steady7 = within7(g('daily_steady')).length

  const totalSignals = Object.values(byType).reduce((a, v) => a + v.length, 0)
  const isEmpty = !tracker && totalSignals === 0 && checkins.length === 0 && urgeLogs.length === 0 && activityLogs.length === 0

  const Chips = ({ items }) => (
    <div style={styles.chipRow}>
      {items.map((c, i) => (
        <div key={i} style={styles.chip}>
          <span style={styles.chipNum}>{c.v}</span>
          <span style={styles.chipLabel}>{c.l}</span>
        </div>
      ))}
    </div>
  )

  // ---- Oracle tour steps. Each step uses the SAME condition that gates its
  // section's render, so an arrow never points at a section that isn't there. ----
  const tourSteps = [
    {
      ref: poolRef,
      title: 'This is your Oracle.',
      body: 'A still pool that reflects your journey. The more you check in and log, the clearer it grows. Tap it to drop a pebble and see today’s reflection.',
      placement: 'bottom',
    },
    ...(!isEmpty && !isReclaim ? [{
      ref: sealRef,
      title: 'Your week, reflected.',
      body: 'Each week, Vow gathers what you’ve logged into a quiet reflection on how you’re really doing — revealed when you’re ready to look.',
      placement: 'bottom',
    }] : []),
    ...(!isEmpty && !isReclaim && strip.length > 0 ? [{
      ref: weatherRef,
      title: 'The week’s weather.',
      body: 'A glance at your recent mood and energy, and how often the pull showed up. Texture, not judgement.',
      placement: 'top',
    }] : []),
    ...(!isEmpty && !isReclaim && hasPull ? [{
      ref: pullRef,
      title: 'The shape of the pull.',
      body: 'What you’re learning about your urges over time — when they come, and what tends to be around them.',
      placement: 'top',
    }] : []),
    ...(!isEmpty && !isReclaim && hasBuilt ? [{
      ref: builtRef,
      title: 'What you’re building.',
      body: 'The reasons and defenses you’ve been putting in place — proof of who you’re becoming, in your own words.',
      placement: 'top',
    }] : []),
    {
      ref: archiveRef,
      title: 'Every word, kept.',
      body: 'All your journal entries gather here. Tap any one to read it back — or change it. Nothing you write is lost.',
      placement: 'top',
    },
  ]

  return (
    <div style={styles.frame}>
      <div style={styles.phone}>

        <div style={styles.topRow}>
          <div style={{ width: '40px' }} />
          <span style={styles.brandCenter}><VowBrandMark size={17} /></span>
          <button onClick={() => navigate('/app/profile')} style={styles.profileBtn} aria-label="Profile"><ProfileIcon /></button>
        </div>

        {/* THE ORACLE POOL — the tree reflected in still water; clarity grows with tending */}
        <div ref={poolRef}>
        <OraclePool
          clarity={poolClarity}
          daysTended={daysTended}
          pebbleCount={pebbleCount}
          pebbleToday={pebbleToday}
          aiReflection={aiReflection}
          onPebble={dropPebble}
        />
        </div>

        {isEmpty ? (
          <div style={styles.emptyBlock}>
            <div style={styles.ornament}>· · ·</div>
            <p style={styles.eyebrow}>Nothing to reflect yet</p>
            <h1 style={styles.emptyTitle}>Your Oracle fills as you log.</h1>
            <p style={styles.emptyBody}>Check in, notice the pull, name what you're building. Come back in a week — the longer view will have formed here.</p>
            <div style={styles.ornament}>· · ·</div>
          </div>
        ) : (
          <>
            <div style={styles.lead}>
              <p style={styles.leadEyebrow}>The longer view</p>
              <h1 style={styles.pageTitle}>Oracle of Vow</h1>
              <p style={styles.pageSubtitle}>{firstName ? `${firstName}, the patterns underneath — gathered over time.` : 'The patterns underneath — gathered over time.'}</p>
            </div>

            {/* TOP: Fracture (reclaim) OR the Seal + Oracle */}
            {isReclaim && fr ? (
              <div style={styles.clinicalCard}>
                <h3 style={styles.clinicalHeader}>Anatomy of a Fracture</h3>
                <p style={styles.clinicalBody}>A slip does not erase biology. Let's look, gently, at the math of the fracture.</p>
                <div style={styles.clinicalDivider} />
                <p style={styles.clinicalData}>
                  Your perimeter broke at <strong style={styles.clinicalHighlight}>{fractureReason}</strong>
                  {sleepStr ? <> — and in the days prior, your sleep was running <strong style={styles.clinicalHighlight}>{sleepStr.toLowerCase()}</strong></> : null}
                  {topNeed ? <>, while what it was really reaching for was <strong style={styles.clinicalHighlight}>{String(topNeed[0]).toLowerCase()}</strong></> : null}.
                  {' '}You were carrying more than willpower could hold. That is data, not a verdict.
                </p>
              </div>
            ) : (
              <div ref={sealRef}>
                <SundaySeal summary={summary} />
              </div>
            )}

            {/* THE GENTLE INVENTORY — reclaim only: what the four tools hold */}
            {isReclaim && (shieldsRaised > 0 || kinderLetters > 0 || (standsLatest && standsLatest.length) || topNeed) && (
              <div style={styles.softCard}>
                <p style={styles.eyebrow}>The gentle inventory</p>
                <p style={styles.portraitHelper}>What you've been doing about it — none of it small.</p>
                {standsLatest && standsLatest.length > 0 && (
                  <p style={styles.portraitLine}>{standsLatest.length} {standsLatest.length === 1 ? 'thing' : 'things'} you named that still stand — the slip took none of them.</p>
                )}
                {topNeed && (
                  <p style={styles.portraitLine}>What it keeps reaching for, by your own logs: {String(topNeed[0]).toLowerCase()}. That need is legitimate — the route wasn't.</p>
                )}
                {(shieldsRaised > 0 || kinderLetters > 0) && (
                  <Chips items={[
                    ...(shieldsRaised ? [{ v: shieldsRaised, l: shieldsRaised === 1 ? 'shield raised' : 'shields raised' }] : []),
                    ...(topWindow ? [{ v: String(topWindow[0]), l: 'watched window' }] : []),
                    ...(kinderLetters ? [{ v: kinderLetters, l: kinderLetters === 1 ? 'kinder letter kept' : 'kinder letters kept' }] : []),
                  ]} />
                )}
              </div>
            )}

            {/* THE WEEK'S WEATHER — recent texture (hidden in reclaim) */}
            {!isReclaim && strip.length > 0 && (
              <div ref={weatherRef} style={styles.softCard}>
                <p style={styles.eyebrow}>The week's weather</p>
                <div style={styles.moodStrip}>
                  {strip.map((c, i) => {
                    const m = moodByScore(c.mood_score) || moodByValue(c.mood)
                    return <span key={i} style={{ ...styles.moodDot, background: m?.color || '#C8B79C' }} title={m?.label || ''} />
                  })}
                </div>
                <p style={styles.softBody}>
                  {energyAvg ? `Energy held around ${energyAvg.toFixed(1)} of 5` : 'A few quiet check-ins'}
                  {pullDays > 0 ? ` · the pull surfaced ${pullDays} ${pullDays === 1 ? 'day' : 'days'}.` : ' · the pull stayed quiet.'}
                </p>
                {(lowDays7 > 0 || steady7 > 0) && (
                  <p style={styles.softBody}>
                    {lowDays7 > 0 ? `${lowDays7} ${lowDays7 === 1 ? 'day' : 'days'} ran on low sleep, food, or movement` : 'The basics held'}
                    {steady7 > 0 ? ` · ${steady7} steady ${steady7 === 1 ? 'minute' : 'minutes'} taken.` : '.'}
                  </p>
                )}
              </div>
            )}

            {/* PORTRAIT A — the shape of the pull */}
            {!isReclaim && hasPull && (
              <div ref={pullRef} style={styles.softCard}>
                <p style={styles.eyebrow}>The shape of the pull</p>
                <p style={styles.portraitHelper}>What you've learned about it, gathered over time.</p>
                {pullLines.map((t, i) => <p key={i} style={styles.portraitLine}>{t}</p>)}
                {pullChips.length > 0 && <Chips items={pullChips} />}
              </div>
            )}

            {/* PORTRAIT B — what you're building in its place */}
            {!isReclaim && hasBuilt && (
              <div ref={builtRef} style={styles.builtCard}>
                <p style={styles.groundEyebrow}>What you're building in its place</p>
                {builtLines.map((l, i) => (
                  l.kind === 'vow'
                    ? <p key={i} style={styles.portraitVow}>“{l.text}”</p>
                    : <p key={i} style={styles.portraitLine}>{l.text}</p>
                ))}
                {builtChips.length > 0 && <Chips items={builtChips} />}
              </div>
            )}

            {/* THE ALCHEMY — contradiction into proof */}
            {!isReclaim && evidenceText && (
              <div style={styles.vaultCard}>
                {dissonance?.value && dissonance?.action ? (
                  <>
                    <p style={styles.alchemyOld}>Weeks ago, you named the gap
                      <span style={styles.alchemyQuote}>“{dissonance.value}” — and yet, “{dissonance.action}”</span>
                    </p>
                    <div style={styles.alchemyDivider}>↓</div>
                  </>
                ) : null}
                <p style={styles.alchemyNew}>And then you proved
                  <span style={styles.alchemyQuoteNew}>“{evidenceText}”</span>
                </p>
              </div>
            )}

            {/* THE MAP — confidence vs guard, from the blind-spot tool */}
            {!isReclaim && mapLine && (
              <div style={styles.driftCard}>
                <p style={styles.eyebrow}>The map</p>
                <p style={styles.driftHelper}>Where you placed yourself, last time you looked.</p>
                <p style={styles.portraitLine}>{mapLine}</p>
                {driftRows.length > 1 && (
                  <p style={styles.driftHelper}>{driftRows.length} readings taken — the trail is on the tool itself.</p>
                )}
              </div>
            )}

            {/* THE GROUND YOU'VE HELD — hidden in reclaim (no shame spiral) */}
            {!isReclaim && tracker && (
              <div style={styles.groundCard}>
                <p style={styles.groundEyebrow}>The ground you've held</p>
                <div style={styles.groundRow}>
                  <div style={styles.groundStat}><span style={styles.groundNum}>{daysFree}</span><span style={styles.groundLabel}>{daysFree === 1 ? 'day free' : 'days free'}</span></div>
                  {longestDays != null && <div style={styles.groundStat}><span style={styles.groundNum}>{longestDays}</span><span style={styles.groundLabel}>longest stretch</span></div>}
                  {resets != null && <div style={styles.groundStat}><span style={styles.groundNum}>{resets}</span><span style={styles.groundLabel}>{resets === 1 ? 'slip weathered' : 'slips weathered'}</span></div>}
                </div>
              </div>
            )}

            <p style={styles.footnote}>The Oracle reflects only what you log. It grows quieter or richer with you.</p>
          </>
        )}

        <div style={styles.archiveDivider} />
        <div ref={archiveRef}><JournalArchive /></div>

        <VowPathInvite variant="calm" />

        <BottomNav />

        {/* Gentle guided tour — first visit to Oracle, replayable via "?" */}
        <CoachMark steps={tourSteps} open={tourOpen} onClose={finishTour} />
        {!tourOpen && (
          <button onClick={() => setTourOpen(true)} style={styles.tourReplay} aria-label="Show me around" title="Show me around">?</button>
        )}
      </div>
    </div>
  )
}

const styles = {
  frame: { minHeight: '100vh', background: 'linear-gradient(180deg, #EFEAE0 0%, #F2EDE3 100%)', padding: '1.25rem 1rem 6rem', display: 'flex', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  phone: { maxWidth: '440px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' },
  loading: { textAlign: 'center', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', padding: '4rem 0' },

  topRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' },
  profileBtn: { background: 'transparent', border: 'none', color: '#854F0B', cursor: 'pointer', padding: '4px 8px', minWidth: '40px', display: 'flex', justifyContent: 'flex-end' },
  brandCenter: { position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', pointerEvents: 'none' },

  lead: { padding: '0.25rem 0 0.25rem' },
  leadEyebrow: { fontSize: '10.5px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 10px' },
  pageTitle: { fontFamily: 'Georgia, serif', fontSize: '30px', fontWeight: 500, margin: '0 0 6px', color: '#2A1F15', letterSpacing: '-0.02em' },
  pageSubtitle: { fontFamily: 'Georgia, serif', fontSize: '15px', fontStyle: 'italic', color: '#854F0B', margin: 0 },

  // Vault (dark) cards — Seal & Alchemy
  vaultCard: { background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', borderRadius: '18px', padding: '22px', boxShadow: '0 12px 28px -12px rgba(40,25,10,0.45)' },
  archiveDivider: { height: 1, background: 'linear-gradient(90deg, transparent, rgba(133,79,11,0.18), transparent)', margin: '26px 0 20px' },
  tourReplay: { position: 'fixed', right: '16px', bottom: '88px', width: '34px', height: '34px', borderRadius: '50%', border: '0.5px solid #DDCFB6', background: '#FCFAF5', color: '#854F0B', fontSize: '16px', fontFamily: 'Georgia, serif', fontStyle: 'italic', cursor: 'pointer', boxShadow: '0 4px 14px rgba(60,40,20,0.18)', zIndex: 1500 },
  sealGlyph: { textAlign: 'center', fontSize: '20px', margin: '0 0 12px' },
  vaultEyebrow: { fontSize: '10px', color: '#D9B57A', textTransform: 'uppercase', letterSpacing: '0.22em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 10px' },
  vaultTextRegular: { fontFamily: 'Georgia, serif', fontSize: '16px', color: '#FAF7F1', margin: 0, lineHeight: 1.6, fontStyle: 'italic' },
  vaultTextItalic: { fontFamily: 'Georgia, serif', fontSize: '15px', fontStyle: 'italic', color: '#9C8C78', textAlign: 'center', margin: 0, lineHeight: 1.55 },
  sealHint: { fontSize: '11px', color: '#D9B57A', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '10px', display: 'block', fontStyle: 'normal' },

  // Oracle of Vow — premium AI-reflection card
  oracleCard: { background: 'linear-gradient(155deg, #2E2114 0%, #20140C 100%)', border: '1px solid rgba(217,181,122,0.30)', borderRadius: '18px', padding: '20px', boxShadow: '0 12px 28px -14px rgba(40,25,10,0.5)' },
  oracleHead: { display: 'flex', alignItems: 'center', gap: '14px' },
  oracleGlyph: { fontSize: '22px', color: '#D9B57A', lineHeight: 1, flexShrink: 0, textShadow: '0 0 14px rgba(217,181,122,0.45)' },
  oracleEyebrow: { fontSize: '10px', color: '#D9B57A', textTransform: 'uppercase', letterSpacing: '0.24em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 4px' },
  oracleTitle: { fontFamily: 'Georgia, serif', fontSize: '16px', color: '#F4ECDD', margin: 0, lineHeight: 1.4, fontStyle: 'italic' },
  oracleCta: { marginTop: '16px', width: '100%', background: 'rgba(217,181,122,0.12)', border: '0.5px solid rgba(217,181,122,0.4)', color: '#E9CE9B', fontFamily: 'Georgia, serif', fontSize: '13.5px', letterSpacing: '0.02em', padding: '11px', borderRadius: '11px', cursor: 'pointer' },
  oracleBody: { marginTop: '14px', borderTop: '0.5px solid rgba(217,181,122,0.18)', paddingTop: '14px' },
  oracleReflection: { fontFamily: 'Georgia, serif', fontSize: '14.5px', fontStyle: 'italic', color: '#E8DCC6', lineHeight: 1.65, margin: 0 },
  oraclePending: { fontFamily: 'Georgia, serif', fontSize: '12px', color: '#D9B57A', letterSpacing: '0.03em', margin: '14px 0 0', lineHeight: 1.5, opacity: 0.92 },
  oracleClose: { marginTop: '14px', background: 'transparent', border: 'none', color: '#9C8C78', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', padding: 0 },

  // Clinical card — Fracture
  clinicalCard: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)', border: '0.5px solid rgba(133,79,11,0.18)', borderLeft: '4px solid #854F0B', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 14px rgba(80,50,20,0.05)' },
  clinicalHeader: { fontFamily: 'Georgia, serif', fontSize: '17px', color: '#854F0B', margin: '0 0 8px', fontWeight: 600 },
  clinicalBody: { fontFamily: 'Georgia, serif', fontSize: '14px', color: '#6B5C4A', margin: '0 0 16px', lineHeight: 1.55, fontStyle: 'italic' },
  clinicalDivider: { height: '1px', background: 'rgba(133,79,11,0.12)', margin: '0 0 16px' },
  clinicalData: { fontFamily: 'Georgia, serif', fontSize: '14.5px', color: '#2A1F15', margin: 0, lineHeight: 1.7 },
  clinicalHighlight: { color: '#854F0B', fontWeight: 600 },

  // Soft cards — Weather & Portrait A
  softCard: { background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)', border: '0.5px solid #E8DFD0', borderRadius: '18px', padding: '18px', boxShadow: '0 4px 16px rgba(80,50,20,0.05)' },
  eyebrow: { fontSize: '10.5px', color: '#A07A3C', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 12px' },
  softBody: { fontSize: '13.5px', color: '#6B5C4A', fontFamily: 'Georgia, serif', lineHeight: 1.6, margin: '12px 0 0' },
  moodStrip: { display: 'flex', gap: '8px', alignItems: 'center' },
  moodDot: { width: '22px', height: '22px', borderRadius: '50%', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.12)', flexShrink: 0 },

  // Portraits (shared)
  portraitHelper: { fontSize: '12.5px', color: '#854F0B', margin: '-6px 0 14px', opacity: 0.85, fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  portraitLine: { fontFamily: 'Georgia, serif', fontSize: '15px', fontStyle: 'italic', color: '#3F3528', lineHeight: 1.6, margin: '0 0 10px' },
  portraitVow: { fontFamily: 'Georgia, serif', fontSize: '17px', fontStyle: 'italic', color: '#854F0B', lineHeight: 1.5, margin: '0 0 12px' },
  builtCard: { background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)', border: '0.5px solid #E0CDB3', borderRadius: '18px', padding: '18px', boxShadow: '0 3px 12px rgba(80,50,20,0.05)' },

  // Stat chips
  chipRow: { display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' },
  chip: { flex: '1 1 64px', minWidth: '64px', background: 'rgba(133,79,11,0.05)', border: '0.5px solid rgba(133,79,11,0.08)', borderRadius: '12px', padding: '10px 6px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '3px' },
  chipNum: { fontFamily: 'Georgia, serif', fontSize: '18px', color: '#854F0B', fontWeight: 500, lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' },
  chipLabel: { fontSize: '10.5px', color: '#8A7558', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.25 },

  // Alchemy
  alchemyOld: { fontSize: '12px', color: '#9C8C78', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' },
  alchemyQuote: { fontFamily: 'Georgia, serif', fontSize: '16px', fontStyle: 'italic', textTransform: 'none', letterSpacing: 0, color: '#9C8C78', display: 'block', marginTop: '6px', lineHeight: 1.5 },
  alchemyDivider: { textAlign: 'center', color: '#6B5C4A', fontSize: '18px', margin: '14px 0' },
  alchemyNew: { fontSize: '12px', color: '#D9B57A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' },
  alchemyQuoteNew: { fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: '#D9B57A', display: 'block', marginTop: '6px', lineHeight: 1.45 },

  // Drift heatmap
  driftCard: { background: 'rgba(133,79,11,0.035)', borderRadius: '16px', padding: '18px', border: '0.5px solid rgba(133,79,11,0.10)' },
  driftHelper: { fontSize: '12.5px', color: '#854F0B', margin: '-6px 0 14px', opacity: 0.8, fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  driftRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', lineHeight: 1.8 },
  driftDot: { color: '#6B5C4A', opacity: 0.3, fontSize: '18px', margin: '0 4px' },

  // Ground
  groundCard: { background: 'linear-gradient(180deg, #FBF6EA 0%, #F4ECDD 100%)', border: '0.5px solid #E0CDB3', borderRadius: '18px', padding: '18px', boxShadow: '0 3px 12px rgba(80,50,20,0.05)' },
  groundEyebrow: { fontSize: '10.5px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 14px' },
  groundRow: { display: 'flex', justifyContent: 'space-around', gap: '10px' },
  groundStat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flex: 1 },
  groundNum: { fontSize: '26px', color: '#854F0B', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
  groundLabel: { fontSize: '11px', color: '#8A7558', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.3 },

  footnote: { fontSize: '11.5px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.5, margin: '4px 0 0' },

  emptyBlock: { textAlign: 'center', padding: '3.5rem 1rem 2rem' },
  ornament: { fontSize: '14px', color: '#C5AE8A', letterSpacing: '0.5em', margin: '0 0 1.5rem' },
  emptyTitle: { fontSize: '24px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.3, margin: '0 0 1.25rem', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' },
  emptyBody: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.7, margin: '0 auto 1.5rem', maxWidth: '320px' },
}