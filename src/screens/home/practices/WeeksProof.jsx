// ===================================================================
// TOOL: "The week's proof"  (Staying steady)
// ===================================================================
// Steadiness gets invisible, and doubt argues badly against a
// written record — so the record is a shelf now. Each entry sets a
// stone on it, engraved with what kind of proof it was; this week's
// stones sit in gold. The shelf fills; the doubting voice runs out
// of room.
//
// Data: free_stage_signals, stage 'build', signal_type
// 'build_evidence' (unchanged), payload { kind, proof, instead,
// week_of, forged_at } — appended per entry, as before.
// ===================================================================
import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'
import { getUser, ScienceFooter, K, P } from './practiceKit'

const KINDS = [
  { key: 'said_no',  label: 'Said no',            short: 'no' },
  { key: 'sat_urge', label: 'Sat through an urge', short: 'sat' },
  { key: 'people',   label: 'Chose people',        short: 'people' },
  { key: 'built',    label: 'Built something',     short: 'built' },
  { key: 'rested',   label: 'Rested on purpose',   short: 'rested' },
]
const shortFor = (kind) => (KINDS.find(k => k.key === kind) || {}).short || 'proof'

const mondayISO = () => {
  const d = new Date()
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const SHELF_CSS = `
@keyframes vowStoneLand { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }
.vowProofNew { animation: vowStoneLand 0.5s ease-out; }
@media (prefers-reduced-motion: reduce) { .vowProofNew { animation: none !important; } }`

function EvidenceShelf({ entries, justSet }) {
  const shown = entries.slice(0, 8) // newest first
  const thisWeek = mondayISO()
  const shelfY = [70, 128]
  return (
    <div style={{ ...K.stage, height: 156 }}>
      <style>{SHELF_CSS}</style>
      <svg viewBox="0 0 300 156" style={{ display: 'block', width: '100%', height: '100%' }}>
        <rect x="0" y="0" width="300" height="156" fill="#F6F1E3" />
        {/* two wooden shelves */}
        {shelfY.map((y, i) => (
          <g key={i}>
            <rect x="26" y={y} width="248" height="6" rx="2.5" fill={P.bark} />
            <rect x="26" y={y + 6} width="248" height="2.5" rx="1" fill={P.barkDark} opacity="0.5" />
          </g>
        ))}
        {/* the stones — newest lands first position, top shelf */}
        {shown.map((e, i) => {
          const shelf = i < 4 ? 0 : 1
          const slot = i % 4
          const cx = 58 + slot * 62
          const cy = shelfY[shelf] - 12
          const isWeek = e.week_of === thisWeek
          return (
            <g key={i} className={justSet && i === 0 ? 'vowProofNew' : undefined}>
              <ellipse cx={cx + 1} cy={cy + 10} rx="21" ry="3" fill={P.barkDark} opacity="0.12" />
              <path d={`M ${cx - 22} ${cy + 10} Q ${cx - 24} ${cy - 8} ${cx - 8} ${cy - 11} Q ${cx + 12} ${cy - 14} ${cx + 21} ${cy - 2} Q ${cx + 25} ${cy + 8} ${cx + 12} ${cy + 10} Z`}
                fill={isWeek ? P.gold : P.stone} opacity={isWeek ? 0.92 : 0.85}
                stroke={isWeek ? P.deepGold : P.stoneEdge} strokeWidth="0.6" />
              <text x={cx} y={cy + 3.5} textAnchor="middle" fontFamily="Georgia, serif" fontSize="8"
                fontStyle="italic" fill={isWeek ? '#5C3A08' : P.body}>{shortFor(e.kind)}</text>
            </g>
          )
        })}
        {entries.length === 0 && (
          <text x="150" y="52" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9.5" fontStyle="italic" fill={P.muted}>
            an empty shelf — the first stone is one honest sentence away
          </text>
        )}
        {entries.length > 8 && (
          <text x="288" y="150" textAnchor="end" fontFamily="Georgia, serif" fontSize="8" fontStyle="italic" fill={P.body} opacity="0.85">
            +{entries.length - 8} in the archive
          </text>
        )}
      </svg>
    </div>
  )
}

export default function WeeksProof({ stage = 'build' }) {
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState([])
  const [kind, setKind] = useState('')
  const [proof, setProof] = useState('')
  const [instead, setInstead] = useState('')
  const [saving, setSaving] = useState(false)
  const [justSet, setJustSet] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const user = await getUser()
      if (!user || cancelled) { setLoading(false); return }
      const { data } = await supabase
        .from('free_stage_signals')
        .select('payload')
        .eq('user_id', user.id)
        .eq('signal_type', 'build_evidence')
        .order('created_at', { ascending: false })
        .limit(24)
      if (cancelled) return
      setEntries((data || []).map((r) => r.payload).filter((p) => p?.proof))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const canSave = proof.trim().length > 0
  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    const user = await getUser()
    if (!user) { setSaving(false); return }
    const payload = { kind: kind || null, proof: proof.trim(), instead: instead.trim() || null, week_of: mondayISO(), forged_at: new Date().toISOString() }
    const { error } = await supabase.from('free_stage_signals')
      .insert({ user_id: user.id, stage, signal_type: 'build_evidence', payload })
    if (!error) {
      setEntries((r) => [payload, ...r])
      setKind(''); setProof(''); setInstead('')
      setJustSet(true); setTimeout(() => setJustSet(false), 700)
    }
    setSaving(false)
  }

  const thisWeekCount = entries.filter(e => e.week_of === mondayISO()).length
  const latest = entries.slice(0, 3)

  if (loading) return <p style={K.muted}>One moment…</p>

  return (
    <div style={K.wrap}>
      <p style={K.intro}>
        One thing you actually did — entered into evidence and set on the shelf. Doubt argues badly against a written record; it argues worse against a full shelf.
      </p>
      <EvidenceShelf entries={entries} justSet={justSet} />
      <p style={K.q}>What kind of proof is it?</p>
      <div style={K.chips}>
        {KINDS.map((k) => (
          <button key={k.key} onClick={() => setKind(kind === k.key ? '' : k.key)} style={{ ...K.chip, ...(kind === k.key ? K.chipOn : {}) }}>{k.label}</button>
        ))}
      </div>
      <input style={V.input} value={proof} onChange={(e) => setProof(e.target.value)} maxLength={120}
        placeholder="What you did, plainly" />
      <input style={{ ...V.input, marginTop: 8 }} value={instead} onChange={(e) => setInstead(e.target.value)} maxLength={120}
        placeholder="Instead of… (optional)" />
      <button style={{ ...K.saveBtn, ...(!canSave ? K.saveBtnDim : {}) }} disabled={!canSave || saving} onClick={handleSave}>
        {saving ? 'One moment…' : 'Set the stone'}
      </button>
      {latest.length > 0 && (
        <div style={K.pattern}>
          <p style={K.patternLabel}>{entries.length} stone{entries.length === 1 ? '' : 's'} on record · {thisWeekCount} this week</p>
          {latest.map((e, i) => (
            <p key={i} style={{ ...K.patternText, margin: '2px 0' }}>
              “{e.proof}”{e.instead ? ` — instead of ${e.instead}` : ''}
            </p>
          ))}
        </div>
      )}
      <ScienceFooter text="Self-efficacy — the load-bearing belief in recovery — is built from performance evidence, not affirmation: concrete memories of things actually done. A written record works because doubt is a prosecutor that only loses to exhibits, and every stone on this shelf is one." />
    </div>
  )
}

const V = {
  input: { width: '100%', boxSizing: 'border-box', marginTop: 10, padding: '11px 13px', borderRadius: 12, border: '0.5px solid #E2D7C3', background: '#FDFBF6', fontFamily: 'Georgia, serif', fontSize: 13, color: '#2A1F15', outline: 'none' },
}