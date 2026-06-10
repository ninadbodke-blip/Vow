import { useEffect, useState } from 'react'
import { supabase } from '../../../supabaseClient'

// ===================================================================
// PRACTICE: "What still stands"  (Getting back up)
// ===================================================================
// After a slip, the voice says "everything's gone." This practice is
// the inventory that proves otherwise: the user taps each thing the
// slip did not take, and watches the list stand. No pep talk — just
// evidence.
//
// Data: free_stage_signals, stage 'reclaim',
// signal_type 'reclaim_stands', payload { kept: [keys], date }.
// One row per day, updated in place.
// ===================================================================

const STANDS = [
  { key: 'reasons',  label: 'Your reasons' },
  { key: 'days',     label: 'Every day you already had' },
  { key: 'learning', label: 'What you know about the pattern now' },
  { key: 'people',   label: 'The people who know' },
  { key: 'tools',    label: 'Your tools and routines' },
  { key: 'here',     label: 'The fact that you came back here' },
]

const localDateStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function WhatStillStands({ stage = 'reclaim' }) {
  const [loading, setLoading] = useState(true)
  const [todayRowId, setTodayRowId] = useState(null)
  const [kept, setKept] = useState([])
  const [saving, setSaving] = useState(false)
  const [savedToday, setSavedToday] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) { setLoading(false); return }
      const { data } = await supabase
        .from('free_stage_signals')
        .select('id, payload')
        .eq('user_id', user.id)
        .eq('signal_type', 'reclaim_stands')
        .order('created_at', { ascending: false })
        .limit(3)
      if (cancelled) return
      const today = localDateStr()
      const todays = (data || []).find((r) => r.payload?.date === today)
      if (todays) {
        setTodayRowId(todays.id)
        setKept(Array.isArray(todays.payload.kept) ? todays.payload.kept : [])
        setSavedToday(true)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const toggle = async (key) => {
    const next = kept.includes(key) ? kept.filter((k) => k !== key) : [...kept, key]
    setKept(next)
    setSavedToday(false)
  }

  const handleSave = async () => {
    if (saving || kept.length === 0) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const payload = { kept, date: localDateStr() }
    if (todayRowId) {
      const { error } = await supabase.from('free_stage_signals').update({ payload }).eq('id', todayRowId)
      if (!error) setSavedToday(true)
    } else {
      const { data, error } = await supabase.from('free_stage_signals')
        .insert({ user_id: user.id, stage, signal_type: 'reclaim_stands', payload })
        .select('id').single()
      if (!error && data) { setTodayRowId(data.id); setSavedToday(true) }
    }
    setSaving(false)
  }

  if (loading) return <p style={S.muted}>One moment…</p>

  return (
    <div style={S.wrap}>
      <p style={S.intro}>
        A slip takes a day. It does not take the ground you stood on. Tap what is still yours — slowly is fine.
      </p>

      <div style={S.list}>
        {STANDS.map((s) => {
          const on = kept.includes(s.key)
          return (
            <button key={s.key} onClick={() => toggle(s.key)} style={{ ...S.stand, ...(on ? S.standOn : {}) }}>
              <span style={{ ...S.pillar, ...(on ? S.pillarOn : {}) }} />
              <span style={{ ...S.standLabel, ...(on ? S.standLabelOn : {}) }}>{s.label}</span>
            </button>
          )
        })}
      </div>

      {kept.length > 0 && (
        <p style={S.countLine}>
          {kept.length === STANDS.length
            ? 'All of it. All of it is still standing.'
            : `${kept.length} ${kept.length === 1 ? 'thing' : 'things'} still standing — and that list is real.`}
        </p>
      )}

      {!savedToday && (
        <button style={{ ...S.saveBtn, opacity: kept.length > 0 ? 1 : 0.45 }} disabled={kept.length === 0 || saving} onClick={handleSave}>
          {saving ? 'Saving…' : 'Keep the list'}
        </button>
      )}
      {savedToday && kept.length > 0 && (
        <p style={S.savedNote}>Kept. It will be here tomorrow too.</p>
      )}
    </div>
  )
}

const S = {
  wrap: { padding: '2px 2px 6px' },
  muted: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#9C8C78', fontSize: 13.5, textAlign: 'center', padding: '18px 0' },
  intro: { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6B5C4A', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 14px' },
  list: { display: 'flex', flexDirection: 'column', gap: 7 },
  stand: { display: 'flex', alignItems: 'center', gap: 11, textAlign: 'left', padding: '12px 13px', borderRadius: 12, border: '0.5px solid #E2D7C3', background: '#FDFBF6', cursor: 'pointer' },
  standOn: { background: '#F4EFE0', border: '1px solid #C9A85C', boxShadow: '0 1px 6px rgba(133,79,11,0.08)' },
  pillar: { width: 4, height: 20, borderRadius: 3, background: '#E2D7C3', flexShrink: 0, transition: 'background 0.25s' },
  pillarOn: { background: 'linear-gradient(180deg, #D9B57A, #B8954C)' },
  standLabel: { fontFamily: 'Georgia, serif', fontSize: 13.5, color: '#6B5C4A' },
  standLabelOn: { color: '#2A1F15' },
  countLine: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: '#854F0B', margin: '14px 0 0', textAlign: 'center', lineHeight: 1.5 },
  saveBtn: { width: '100%', marginTop: 14, padding: '13px', background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)', color: '#FAF7F1', border: 'none', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  savedNote: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#9C8C78', margin: '12px 0 0', textAlign: 'center' },
}