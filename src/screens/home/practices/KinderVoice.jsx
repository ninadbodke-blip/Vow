// ===================================================================
// TOOL: "The kinder voice"  (Getting back up)
// ===================================================================
// The harsh voice after a slip is loud and certain. This practice
// doesn't argue with it — it just gives it its true size: a small,
// contained card. Then the user writes what they'd say to a friend
// they love in the exact same situation, and that line gets the
// large, lit card. Every kinder line is kept — a drawer of letters
// you've written yourself, for the nights the loud voice returns.
//
// Data: free_stage_signals, stage 'reclaim', signal_type
// 'reclaim_kinder' (unchanged), payload { harsh, kinder, date } —
// appended per writing, as before.
// ===================================================================
import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'
import { localDateStr, getUser, ScienceFooter, K, P } from './practiceKit'

const HARSH = [
  'I ruined everything',
  'I am back to zero',
  'I always do this',
  'What is even the point',
  'I am weak',
]

export default function KinderVoice({ stage = 'reclaim' }) {
  const [loading, setLoading] = useState(true)
  const [letters, setLetters] = useState([])
  const [harsh, setHarsh] = useState('')
  const [ownHarsh, setOwnHarsh] = useState('')
  const [kinder, setKinder] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const user = await getUser()
      if (!user || cancelled) { setLoading(false); return }
      const { data } = await supabase
        .from('free_stage_signals')
        .select('payload')
        .eq('user_id', user.id)
        .eq('signal_type', 'reclaim_kinder')
        .order('created_at', { ascending: false })
        .limit(12)
      if (cancelled) return
      setLetters((data || []).map((r) => r.payload).filter((p) => p?.kinder))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const harshText = harsh === 'own' ? ownHarsh.trim() : harsh
  const canSave = !!harshText && kinder.trim().length > 0

  const handleSave = async () => {
    if (saving || !canSave) return
    setSaving(true)
    const user = await getUser()
    if (!user) { setSaving(false); return }
    const payload = { harsh: harshText, kinder: kinder.trim(), date: localDateStr() }
    const { error } = await supabase.from('free_stage_signals')
      .insert({ user_id: user.id, stage, signal_type: 'reclaim_kinder', payload })
    if (!error) {
      setLetters((l) => [payload, ...l])
      setHarsh(''); setOwnHarsh(''); setKinder('')
      setSavedFlash(true); setTimeout(() => setSavedFlash(false), 2400)
    }
    setSaving(false)
  }

  if (loading) return <p style={K.muted}>One moment…</p>

  return (
    <div style={K.wrap}>
      <p style={K.intro}>
        The loud voice doesn't need arguing with — it needs its true size. Pick what it's saying. Then answer the only question that matters here.
      </p>

      <p style={K.q}>What is the voice saying?</p>
      <div style={K.chips}>
        {HARSH.map((h) => (
          <button key={h} onClick={() => setHarsh(harsh === h ? '' : h)} style={{ ...K.chip, ...(harsh === h ? K.chipOn : {}) }}>{h}</button>
        ))}
        <button onClick={() => setHarsh('own')} style={{ ...K.chip, ...(harsh === 'own' ? K.chipOn : {}) }}>Its own words…</button>
      </div>
      {harsh === 'own' && (
        <input style={K.ownInput} value={ownHarsh} onChange={(e) => setOwnHarsh(e.target.value)}
          placeholder="What is it saying, exactly?" maxLength={80} />
      )}

      {/* the voice, given its true size */}
      {harshText && (
        <div style={V.harshCard}>
          <p style={V.harshEyebrow}>the voice — actual size</p>
          <p style={V.harshLine}>“{harshText}”</p>
        </div>
      )}

      <p style={K.q}>Now — a friend you love slipped last night. Same situation, same history. What do you say to them?</p>
      <div style={V.kindCard}>
        <textarea
          style={V.kindArea}
          value={kinder}
          onChange={(e) => setKinder(e.target.value)}
          placeholder="Say it to them. Then notice who else just heard it…"
          rows={3}
          maxLength={280}
        />
      </div>

      <button onClick={handleSave} disabled={!canSave || saving}
        style={{ ...K.saveBtn, ...(!canSave ? K.saveBtnDim : {}) }}>
        {saving ? 'One moment…' : savedFlash ? 'Kept ✓' : 'Keep the kinder line'}
      </button>
      {savedFlash && <p style={K.doneLine}>Kept. The gap between the two sentences is the practice.</p>}

      {letters.length > 0 && (
        <div style={K.pattern}>
          <p style={K.patternLabel}>Letters you’ve kept — {letters.length}</p>
          {letters.slice(0, 3).map((l, i) => (
            <p key={i} style={V.letterLine}>“{l.kinder}”</p>
          ))}
          {letters.length > 3 && <p style={V.letterMore}>and {letters.length - 3} more, for the nights the loud voice returns</p>}
        </div>
      )}

      <ScienceFooter text="Self-compassion after a lapse isn't softness — in controlled studies it beats self-criticism at preventing the next one, because shame fuels the exact escape loop the habit runs on. The friend-framing works by borrowing a voice you already own; writing it down means it's there when the other one shouts." />
    </div>
  )
}

const V = {
  harshCard: {
    background: 'linear-gradient(180deg, #4A3A2C 0%, #2E2018 100%)',
    borderRadius: 10, padding: '9px 12px', margin: '12px auto 0',
    maxWidth: 240, textAlign: 'center',
  },
  harshEyebrow: { fontSize: 8, color: '#9C8C78', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600, margin: '0 0 3px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' },
  harshLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#CBBA98', margin: 0, lineHeight: 1.45 },
  kindCard: {
    background: 'linear-gradient(180deg, #FCF7EA 0%, #F6EEDA 100%)',
    border: '1px solid #C9A85C', borderRadius: 14, padding: 6,
    boxShadow: '0 8px 22px -10px rgba(133,79,11,0.25)',
  },
  kindArea: {
    width: '100%', boxSizing: 'border-box', padding: '11px 12px',
    borderRadius: 10, border: 'none', background: 'transparent',
    fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14.5,
    color: '#2A1F15', outline: 'none', resize: 'vertical', lineHeight: 1.6,
  },
  letterLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#2A1F15', lineHeight: 1.5, margin: '3px 0' },
  letterMore: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 10.5, color: '#9C8C78', margin: '6px 0 0' },
}