// ===================================================================
// TOOL: "What it costs"  (Weighing it up)
// ===================================================================
// The running meter, now made tangible. Two small numbers — money
// and hours in an ordinary day of it — and from the first
// measurement the meter runs live. Beneath it, the total is
// translated into things: dinners, flights, a laptop; evenings with
// people you love, books, a trip taken wide awake.
//
// Currency: the user's number stays in their own money — no
// conversion, ever. A one-time picker (guessed from device locale,
// confirmed by the user) only switches which reference catalog of
// things we price against. "Just numbers" keeps the old bare-number
// behavior; time equivalents are universal and always shown.
//
// Data: free_stage_signals, stage 'reflect', signal_type
// 'reflect_cost' (unchanged), payload { daily_cost, daily_hours,
// max_horizon, first_measured, currency } — one row, updated in
// place; first_measured and currency are additive (older rows fall
// back to created_at and no-currency).
// ===================================================================
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../supabaseClient'
import { getUser, ScienceFooter, K, P } from './practiceKit'

const HOUR_CHIPS = [0.5, 1, 2, 3, 4, 5]

// ── currencies ─────────────────────────────────────────────────────
const CURRENCIES = [
  { code: 'INR',  chip: '₹ Rupee',      symbol: '₹', locale: 'en-IN' },
  { code: 'USD',  chip: '$ Dollar',     symbol: '$', locale: 'en-US' },
  { code: 'EUR',  chip: '€ Euro',       symbol: '€', locale: 'de-DE' },
  { code: 'GBP',  chip: '£ Pound',      symbol: '£', locale: 'en-GB' },
  { code: 'NONE', chip: 'Just numbers', symbol: '',  locale: 'en-US' },
]
const curFor = (code) => CURRENCIES.find(c => c.code === code) || CURRENCIES[4]

// Initial highlight only — the picker is explicit, the user confirms.
// Unknown regions default to INR while Vow is India-first; flip the
// fallback to 'NONE' at international launch.
const EUROZONE = ['DE', 'FR', 'ES', 'IT', 'NL', 'PT', 'IE', 'AT', 'BE', 'FI', 'GR']
function guessCurrencyCode() {
  try {
    const lang = navigator.language || ''
    const region = (lang.split('-')[1] || '').toUpperCase()
    if (region === 'IN') return 'INR'
    if (region === 'US') return 'USD'
    if (region === 'GB') return 'GBP'
    if (EUROZONE.includes(region)) return 'EUR'
  } catch (e) { /* no-op */ }
  return 'INR'
}

// ── the repository of tangible things ──────────────────────────────
// Rough, honest price points per currency ("about" is the register —
// the footer says so). unit = price of one.
const ITEM_CATALOGS = {
  INR: [
    { one: 'a cutting chai', many: 'cutting chais', unit: 15 },
    { one: 'a movie ticket', many: 'movie tickets', unit: 250 },
    { one: 'a good dinner for two', many: 'good dinners for two', unit: 1500 },
    { one: 'a month of gym membership', many: 'months of gym membership', unit: 1800 },
    { one: 'a pair of wireless earbuds', many: 'pairs of wireless earbuds', unit: 3000 },
    { one: 'an online course, certificate and all', many: 'online courses, certificates and all', unit: 4500 },
    { one: 'a weekend getaway', many: 'weekend getaways', unit: 8000 },
    { one: 'a return flight across the country', many: 'return flights across the country', unit: 9500 },
    { one: 'a new smartphone', many: 'new smartphones', unit: 16000 },
    { one: 'a decent laptop', many: 'decent laptops', unit: 45000 },
    { one: 'an international trip', many: 'international trips', unit: 90000 },
  ],
  USD: [
    { one: 'a good coffee', many: 'good coffees', unit: 5 },
    { one: 'a movie ticket', many: 'movie tickets', unit: 15 },
    { one: 'a month of gym membership', many: 'months of gym membership', unit: 45 },
    { one: 'a dinner for two', many: 'dinners for two', unit: 70 },
    { one: 'a pair of wireless earbuds', many: 'pairs of wireless earbuds', unit: 120 },
    { one: 'an online course, certificate and all', many: 'online courses, certificates and all', unit: 160 },
    { one: 'a return domestic flight', many: 'return domestic flights', unit: 320 },
    { one: 'a weekend road trip', many: 'weekend road trips', unit: 350 },
    { one: 'a new smartphone', many: 'new smartphones', unit: 800 },
    { one: 'a decent laptop', many: 'decent laptops', unit: 1100 },
    { one: 'an international trip', many: 'international trips', unit: 2800 },
  ],
  EUR: [
    { one: 'a good coffee', many: 'good coffees', unit: 4 },
    { one: 'a cinema ticket', many: 'cinema tickets', unit: 12 },
    { one: 'a month of gym membership', many: 'months of gym membership', unit: 35 },
    { one: 'a dinner for two', many: 'dinners for two', unit: 60 },
    { one: 'a pair of wireless earbuds', many: 'pairs of wireless earbuds', unit: 110 },
    { one: 'an online course, certificate and all', many: 'online courses, certificates and all', unit: 140 },
    { one: 'a return flight within Europe', many: 'return flights within Europe', unit: 220 },
    { one: 'a weekend away', many: 'weekends away', unit: 300 },
    { one: 'a new smartphone', many: 'new smartphones', unit: 750 },
    { one: 'a decent laptop', many: 'decent laptops', unit: 1000 },
    { one: 'a long-haul trip', many: 'long-haul trips', unit: 2500 },
  ],
  GBP: [
    { one: 'a good coffee', many: 'good coffees', unit: 4 },
    { one: 'a cinema ticket', many: 'cinema tickets', unit: 12 },
    { one: 'a month of gym membership', many: 'months of gym membership', unit: 32 },
    { one: 'a dinner for two', many: 'dinners for two', unit: 55 },
    { one: 'a pair of wireless earbuds', many: 'pairs of wireless earbuds', unit: 100 },
    { one: 'an online course, certificate and all', many: 'online courses, certificates and all', unit: 130 },
    { one: 'a return flight to Europe', many: 'return flights to Europe', unit: 190 },
    { one: 'a weekend away', many: 'weekends away', unit: 280 },
    { one: 'a new smartphone', many: 'new smartphones', unit: 700 },
    { one: 'a decent laptop', many: 'decent laptops', unit: 950 },
    { one: 'a long-haul trip', many: 'long-haul trips', unit: 2400 },
  ],
}

// Time is the same in every country.
const TIME_CATALOG = [
  { one: 'an unhurried evening with people you love', many: 'unhurried evenings with people you love', unit: 3 },
  { one: 'a book, cover to cover', many: 'books, cover to cover', unit: 6 },
  { one: 'a full night of sleep', many: 'full nights of sleep', unit: 8 },
  { one: 'a beginner\u2019s course in almost anything', many: 'beginner\u2019s courses in almost anything', unit: 25 },
  { one: 'an instrument, learned to your first real song', many: 'instruments, each learned to a first real song', unit: 60 },
  { one: 'a five-day trip, every waking hour of it', many: 'five-day trips, every waking hour of them', unit: 80 },
]

// Three tiers from one total: the largest single thing it covers, an
// abundance line (big count, still imaginable), and a graspable middle.
function pickEquivalents(value, catalog, max = 3) {
  const c = catalog
    .map(i => ({ ...i, count: Math.floor(value / i.unit) }))
    .filter(i => i.count >= 1)
  if (c.length === 0) return []
  const picks = []
  const used = new Set()
  const take = (item) => { if (item && !used.has(item.one)) { used.add(item.one); picks.push(item) } }
  take([...c].sort((a, b) => b.unit - a.unit)[0])
  take([...c].filter(i => i.count <= 500).sort((a, b) => b.count - a.count)[0])
  take([...c].sort((a, b) => Math.abs(a.count - 6) - Math.abs(b.count - 6))[0])
  return picks.slice(0, max)
}
const equivLine = (i, locale) =>
  i.count === 1 ? i.one : `${i.count.toLocaleString(locale)} ${i.many}`

const fmtMoney = (n, cur) => `${cur.symbol}${Math.round(n).toLocaleString(cur.locale)}`
const fmt1 = (n, cur) => (Math.round(n * 10) / 10).toLocaleString(cur.locale)

function MeterCard({ cost, hours, since, cur }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const days = Math.max(0, (now - since) / 86400000)
  const runMoney = cost * days
  const runHours = hours * days
  const sinceLabel = new Date(since).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })
  return (
    <div style={M.card}>
      <p style={M.eyebrow}>The meter, since you first measured — {sinceLabel}</p>
      {cost > 0 && (
        <p style={M.big}>{fmtMoney(runMoney, cur)}<span style={M.unit}> in money</span></p>
      )}
      {hours > 0 && (
        <p style={{ ...M.big, ...(cost > 0 ? { fontSize: 21, opacity: 0.92 } : {}) }}>
          {fmt1(runHours, cur)}<span style={M.unit}> hours</span>
        </p>
      )}
      <p style={M.tick}>it moves while you watch</p>
    </div>
  )
}

// The translation of the total into things — money per the chosen
// catalog, time always. Values are computed at render; they drift by
// paise a minute, which the meter above already dramatizes.
function CouldBe({ cost, hours, since, cur }) {
  const days = Math.max(0, (Date.now() - since) / 86400000)
  const moneyPicks = (cur.code !== 'NONE' && cost > 0)
    ? pickEquivalents(cost * days, ITEM_CATALOGS[cur.code] || [], 3)
    : []
  const timePicks = hours > 0 ? pickEquivalents(hours * days, TIME_CATALOG, 3) : []
  if (moneyPicks.length === 0 && timePicks.length === 0 && !(cur.code === 'NONE' && cost > 0)) {
    return null
  }
  return (
    <div style={K.pattern}>
      <p style={K.patternLabel}>What that could be, instead</p>
      {moneyPicks.map((i, k) => (
        <p key={`m${k}`} style={M.couldLine}>· {equivLine(i, cur.locale)}</p>
      ))}
      {cur.code === 'NONE' && cost > 0 && (
        <p style={M.couldHint}>Pick a currency under “Change the numbers” to see the money as real things.</p>
      )}
      {timePicks.length > 0 && (
        <>
          <p style={M.couldSub}>and the hours —</p>
          {timePicks.map((i, k) => (
            <p key={`t${k}`} style={M.couldLine}>· {equivLine(i, cur.locale)}</p>
          ))}
        </>
      )}
    </div>
  )
}

export default function WhatItCosts({ stage = 'reflect' }) {
  const [loading, setLoading] = useState(true)
  const [rowId, setRowId] = useState(null)
  const [cost, setCost] = useState('')
  const [hours, setHours] = useState(null)
  const [maxHorizon, setMaxHorizon] = useState(null)
  const [currencyCode, setCurrencyCode] = useState(null)   // null until loaded/guessed
  const [firstMeasured, setFirstMeasured] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const firstRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const user = await getUser()
      if (!user || cancelled) { setLoading(false); return }
      const { data } = await supabase
        .from('free_stage_signals')
        .select('id, payload, created_at')
        .eq('user_id', user.id)
        .eq('signal_type', 'reflect_cost')
        .order('created_at', { ascending: false })
        .limit(1)
      if (cancelled) return
      const row = data && data[0]
      if (row && row.payload) {
        setRowId(row.id)
        if (row.payload.daily_cost != null) setCost(String(row.payload.daily_cost))
        if (row.payload.daily_hours != null) setHours(Number(row.payload.daily_hours))
        if (row.payload.max_horizon != null) setMaxHorizon(row.payload.max_horizon)
        // Older rows have no currency — show bare numbers until the user picks.
        setCurrencyCode(row.payload.currency || 'NONE')
        const first = row.payload.first_measured || row.created_at
        firstRef.current = first
        setFirstMeasured(first)
      } else {
        setCurrencyCode(guessCurrencyCode())
        setEditing(true)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const c = Number(cost) || 0
  const h = hours || 0
  const hasInput = c > 0 || h > 0
  const cur = curFor(currencyCode)
  const yearMoney = c * 365
  const yearHours = h * 365
  const wakingDays = Math.round(yearHours / 16)

  const handleSave = async () => {
    if (saving || !hasInput) return
    setSaving(true)
    const user = await getUser()
    if (!user) { setSaving(false); return }
    const first = firstRef.current || new Date().toISOString()
    firstRef.current = first
    const payload = {
      daily_cost: c || null, daily_hours: h || null,
      max_horizon: maxHorizon != null ? maxHorizon : 0,
      first_measured: first,
      currency: cur.code,
    }
    if (rowId) {
      await supabase.from('free_stage_signals').update({ payload }).eq('id', rowId)
    } else {
      const { data } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage, signal_type: 'reflect_cost', payload })
        .select('id').single()
      if (data) setRowId(data.id)
    }
    setFirstMeasured(first)
    setEditing(false)
    setSaving(false)
  }

  if (loading) return <p style={K.muted}>One moment…</p>

  if (!editing && hasInput && firstMeasured) {
    const sinceTs = new Date(firstMeasured).getTime()
    return (
      <div style={K.wrap}>
        <p style={K.intro}>
          An ordinary day of it, carried forward. The meter was always running — the only change is that now it's visible, and now it has a shape.
        </p>
        <MeterCard cost={c} hours={h} since={sinceTs} cur={cur} />
        <CouldBe cost={c} hours={h} since={sinceTs} cur={cur} />
        <div style={M.yearRow}>
          {c > 0 && <span style={M.yearItem}><b style={M.yearNum}>{fmtMoney(yearMoney, cur)}</b> a year</span>}
          {h > 0 && <span style={M.yearItem}><b style={M.yearNum}>{Math.round(yearHours).toLocaleString(cur.locale)}</b> hours a year — about {wakingDays} waking days</span>}
        </div>
        <button style={K.editLink} onClick={() => setEditing(true)}>Change the numbers</button>
        <ScienceFooter text="Small daily amounts are designed to slip past the brain's accounting — denomination neglect — and abstract totals slide off almost as easily. Concrete goods don't: pricing a habit in dinners, flights, and evenings recruits the mental accounting the number alone never reaches. Prices are honest abouts, not quotes." />
      </div>
    )
  }

  return (
    <div style={K.wrap}>
      <p style={K.intro}>Think of an ordinary day of it — not a heavy one. Rough numbers are fine; the meter does the rest.</p>
      <p style={K.q}>See it in…</p>
      <div style={K.chips}>
        {CURRENCIES.map((cc) => (
          <button key={cc.code} onClick={() => setCurrencyCode(cc.code)}
            style={{ ...K.chip, ...(currencyCode === cc.code ? K.chipOn : {}) }}>{cc.chip}</button>
        ))}
      </div>
      <p style={K.q}>About how much money in a day?</p>
      <input
        style={M.input}
        inputMode="numeric"
        value={cost}
        onChange={(e) => setCost(e.target.value.replace(/[^0-9.]/g, ''))}
        placeholder="0"
        maxLength={8}
      />
      <p style={K.q}>And about how much time?</p>
      <div style={K.chips}>
        {HOUR_CHIPS.map((hc) => (
          <button key={hc} onClick={() => setHours(hours === hc ? null : hc)}
            style={{ ...K.chip, ...(hours === hc ? K.chipOn : {}) }}>
            {hc === 0.5 ? 'Half an hour' : `${hc} hour${hc > 1 ? 's' : ''}`}
          </button>
        ))}
      </div>
      {hasInput && (
        <p style={M.preview}>
          Across a year: {c > 0 ? `${fmtMoney(yearMoney, cur)} in money` : ''}{c > 0 && h > 0 ? ' · ' : ''}
          {h > 0 ? `${Math.round(yearHours).toLocaleString(cur.locale)} hours — about ${wakingDays} waking days` : ''}
        </p>
      )}
      <button style={{ ...K.saveBtn, ...(!hasInput ? K.saveBtnDim : {}) }} disabled={!hasInput || saving} onClick={handleSave}>
        {saving ? 'One moment…' : firstMeasured ? 'Update the meter' : 'Start the meter'}
      </button>
      <ScienceFooter text="Small daily amounts are designed to slip past the brain's accounting — denomination neglect — and abstract totals slide off almost as easily. Concrete goods don't: pricing a habit in dinners, flights, and evenings recruits the mental accounting the number alone never reaches. Prices are honest abouts, not quotes." />
    </div>
  )
}

const M = {
  card: {
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    borderRadius: 16, padding: '18px 18px 14px', textAlign: 'center',
    boxShadow: '0 8px 20px -10px rgba(40,25,10,0.45)', margin: '4px 0 10px',
  },
  eyebrow: { fontSize: 9.5, color: '#D9B57A', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600, margin: '0 0 10px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' },
  big: { fontFamily: 'Georgia, serif', fontSize: 30, color: '#F6E8C4', margin: '0 0 2px', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 },
  unit: { fontSize: 12.5, color: '#CBBA98', fontStyle: 'italic' },
  tick: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 10, color: '#9C8C78', margin: '8px 0 0' },
  couldLine: { fontFamily: 'Georgia, serif', fontSize: 13, color: '#2A1F15', lineHeight: 1.55, margin: '2px 0' },
  couldSub: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11.5, color: '#854F0B', margin: '8px 0 2px' },
  couldHint: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11, color: '#9C8C78', margin: '6px 0 0', lineHeight: 1.5 },
  yearRow: { display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'center', margin: '10px 0 0' },
  yearItem: { fontFamily: 'Georgia, serif', fontSize: 12.5, color: '#6B5C4A', fontStyle: 'italic' },
  yearNum: { color: '#2A1F15', fontStyle: 'normal', fontWeight: 500 },
  input: { width: '100%', boxSizing: 'border-box', padding: '11px 13px', borderRadius: 12, border: '0.5px solid #E2D7C3', background: '#FDFBF6', fontFamily: 'Georgia, serif', fontSize: 16, color: '#2A1F15', outline: 'none' },
  preview: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#854F0B', margin: '12px 0 0', textAlign: 'center' },
}