// ===================================================================
// TOOL: "Where it happens"  (A closer look)
// ===================================================================
// The pattern has an address — so this tool draws the map. Each
// moment gets pinned (place, company, hour) and the grid darkens
// where the moments cluster. After a few pins, the tool can name
// its favorite door out loud: "late night · at home · alone."
//
// Data: free_stage_signals, stage 'notice', signal_type
// 'notice_context' (unchanged; same option strings), payload
// { location, company, time_of_day, date } — now APPENDED per pin
// (was one row updated in place), so the map accumulates.
// ===================================================================
import { useState, useEffect } from 'react'
import {
  localDateStr, loadSignals, appendSignal,
  Chips, ScienceFooter, K, P,
} from './practiceKit'

const PLACES  = ['At home', 'At work', 'Commuting', 'Out somewhere', 'A friend\u2019s place', 'Online']
const COMPANY = ['Alone', 'With a partner', 'With friends', 'With colleagues', 'With family', 'Among strangers']
const TIMES   = ['Morning', 'Afternoon', 'Evening', 'Late night']

const ROW_LABELS = ['Home', 'Work', 'Commute', 'Out', 'Friend\u2019s', 'Online']
const COL_LABELS = ['Morn', 'Aft', 'Eve', 'Late']

// grid geometry
const GX = 78, GY = 26, CW = 51, CH = 20, GAP = 4

function MomentMap({ grid, maxCount }) {
  return (
    <div style={{ ...K.stage, height: 178 }}>
      <svg viewBox="0 0 300 178" style={{ display: 'block', width: '100%', height: '100%' }}>
        <rect x="0" y="0" width="300" height="178" fill="#F6F1E3" />
        {/* column headers */}
        {COL_LABELS.map((c, j) => (
          <text key={c} x={GX + j * (CW + GAP) + CW / 2} y={GY - 8} textAnchor="middle"
            fontFamily="Georgia, serif" fontSize="8.5" fontStyle="italic" fill={P.body}>{c}</text>
        ))}
        {/* rows */}
        {ROW_LABELS.map((r, i) => (
          <g key={r}>
            <text x={GX - 8} y={GY + i * (CH + GAP) + CH / 2 + 3} textAnchor="end"
              fontFamily="Georgia, serif" fontSize="8.5" fontStyle="italic" fill={P.body}>{r}</text>
            {COL_LABELS.map((_, j) => {
              const n = grid[i][j]
              const isHot = maxCount > 0 && n === maxCount
              return (
                <g key={j}>
                  <rect x={GX + j * (CW + GAP)} y={GY + i * (CH + GAP)} width={CW} height={CH} rx="5"
                    fill={n > 0 ? P.gold : '#EFE8D5'}
                    opacity={n > 0 ? Math.min(0.22 + n * 0.2, 0.95) : 1}
                    stroke={isHot ? P.deepGold : '#E2D7C3'} strokeWidth={isHot ? 1.4 : 0.6} />
                  {n > 0 && (
                    <text x={GX + j * (CW + GAP) + CW / 2} y={GY + i * (CH + GAP) + CH / 2 + 3}
                      textAnchor="middle" fontFamily="Georgia, serif" fontSize="9"
                      fill={n * 0.2 > 0.4 ? '#FAF7F1' : P.ink}>{n}</text>
                  )}
                </g>
              )
            })}
          </g>
        ))}
        <text x="150" y="172" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8.5" fontStyle="italic" fill={P.muted}>
          darker means it finds you there more often
        </text>
      </svg>
    </div>
  )
}

export default function WhereItHappens({ stage = 'notice' }) {
  const [loading, setLoading] = useState(true)
  const [pins, setPins] = useState([])
  const [location, setLocation] = useState('')
  const [company, setCompany] = useState('')
  const [timeOfDay, setTimeOfDay] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const rows = await loadSignals('notice_context', 60)
      if (cancelled) return
      setPins(rows
        .map(r => ({ location: r.payload?.location, company: r.payload?.company, time: r.payload?.time_of_day }))
        .filter(p => p.location && p.time))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  // build the 6×4 grid
  const grid = PLACES.map(() => TIMES.map(() => 0))
  pins.forEach(p => {
    const i = PLACES.indexOf(p.location), j = TIMES.indexOf(p.time)
    if (i >= 0 && j >= 0) grid[i][j] += 1
  })
  const maxCount = Math.max(0, ...grid.flat())

  const canSave = location && company && timeOfDay
  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    await appendSignal(stage, 'notice_context', { location, company, time_of_day: timeOfDay, date: localDateStr() })
    setPins(prev => [{ location, company, time: timeOfDay }, ...prev])
    setLocation(''); setCompany(''); setTimeOfDay('')
    setSavedFlash(true); setTimeout(() => setSavedFlash(false), 2200)
    setSaving(false)
  }

  // name the favorite door
  let doorLine = null
  if (pins.length >= 3 && maxCount > 0) {
    let hi = 0, hj = 0
    grid.forEach((row, i) => row.forEach((n, j) => { if (n > grid[hi][hj]) { hi = i; hj = j } }))
    const cc = {}
    pins.forEach(p => { if (p.company) cc[p.company] = (cc[p.company] || 0) + 1 })
    const topCompany = Object.entries(cc).sort((a, b) => b[1] - a[1])[0]
    doorLine = `Its favorite door so far: ${TIMES[hj].toLowerCase()} \u00b7 ${PLACES[hi].toLowerCase()}${topCompany ? ` \u00b7 ${topCompany[0].toLowerCase()}` : ''}. Now you know which door to watch.`
  }

  if (loading) return <p style={K.muted}>One moment…</p>

  return (
    <div style={K.wrap}>
      <p style={K.intro}>
        Each time it shows up, pin the moment — where, with whom, when. Three taps. The map darkens where it hunts, and an ambush becomes an appointment.
      </p>
      <MomentMap grid={grid} maxCount={maxCount} />
      <Chips label="Where were you?" options={PLACES} value={location} onPick={setLocation} />
      <Chips label="Who was around?" options={COMPANY} value={company} onPick={setCompany} />
      <Chips label="What time of day?" options={TIMES} value={timeOfDay} onPick={setTimeOfDay} />
      <button onClick={handleSave} disabled={!canSave || saving}
        style={{ ...K.saveBtn, ...(!canSave ? K.saveBtnDim : {}) }}>
        {saving ? 'One moment…' : savedFlash ? 'Pinned ✓' : 'Pin this moment'}
      </button>
      {pins.length > 0 && (
        <div style={K.pattern}>
          <p style={K.patternLabel}>{pins.length} moment{pins.length === 1 ? '' : 's'} pinned</p>
          <p style={K.patternText}>{doorLine || 'A couple more pins and the map will name its favorite door.'}</p>
        </div>
      )}
      <ScienceFooter text="Cravings are conditioned to places and hours even more than to moods — context-dependent cueing is why the pull feels ambient in one room and absent in another. Mapping the coordinates turns a conditioned ambush into a known location, and known locations can be planned for." />
    </div>
  )
}