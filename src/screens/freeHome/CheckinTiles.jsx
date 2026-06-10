import { moodByScore, moodByValue } from './DailyCheckin'

// ===================================================================
// SHARED CHECK-IN TILES
// ===================================================================
// Presentational tiles used by every free home, so the daily check-in
// surface looks and behaves identically across stages. Copy is prop-
// configurable; defaults read for Notice. Data shape comes straight
// from free_daily_checkins rows.
// ===================================================================

function localDateStr(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Build the last 7 days (oldest -> newest), matching check-ins by date.
function buildLast7(checkins) {
  const byDate = {}
  for (const c of checkins) byDate[c.checkin_date] = c
  const todayStr = localDateStr()
  const out = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const ds = localDateStr(d)
    out.push({
      label: 'SMTWTFS'[d.getDay()],
      dateStr: ds,
      checkin: byDate[ds] || null,
      isToday: ds === todayStr,
    })
  }
  return out
}

// ---- Today's check-in (hero) -------------------------------------
export function TodayCheckinTile({
  checkin,
  onOpen,
  eyebrow = "Today's check-in",
  title = 'How are you, really?',
  body = 'A quiet half-minute. Mood, energy, whether the pull came by. Nobody sees it but you.',
  cta = 'Check in',
  loggedEyebrow = "Today's check-in",
}) {
  if (checkin) {
    const m = moodByScore(checkin.mood_score) || moodByValue(checkin.mood)
    return (
      <div style={{ ...styles.tile, ...styles.tileLogged }}>
        <p style={styles.tileEyebrow}>{loggedEyebrow}</p>
        <div style={styles.summaryRow}>
          <span style={{ ...styles.moodPill, background: m?.color || '#B9A07E' }} />
          <div>
            <p style={styles.summaryMood}>
              {m?.label || 'Noted'}{checkin.felt_pull ? ' \u00b7 the pull showed up' : ''}
            </p>
            <p style={styles.summarySub}>
              Energy {checkin.energy ?? '\u2013'}/5
              {checkin.note ? ` \u00b7 \u201c${checkin.note}\u201d` : ''}
            </p>
          </div>
        </div>
        <button onClick={onOpen} style={styles.editBtn}>Edit today's check-in</button>
      </div>
    )
  }
  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>{eyebrow}</p>
      <h2 style={styles.tileTitle}>{title}</h2>
      <p style={styles.tileBody}>{body}</p>
      <button onClick={onOpen} style={styles.cta}>{cta}</button>
    </div>
  )
}

// ---- 7-day awareness strip (mood, not abstinence) ----------------
export function AwarenessStripTile({
  checkins,
  emptyTitle = 'Your week will fill in here.',
  emptyBody = 'One check-in a day. Noticing is the whole job right now.',
  helperFor = (n) => `You've noticed ${n} of the last 7 days. That's the work.`,
}) {
  const days = buildLast7(checkins)
  const noticed = days.filter(d => d.checkin).length

  if (noticed === 0) {
    return (
      <div style={styles.tile}>
        <p style={styles.tileEyebrow}>Last 7 days</p>
        <h3 style={styles.emptyTitle}>{emptyTitle}</h3>
        <p style={styles.helperText}>{emptyBody}</p>
      </div>
    )
  }

  return (
    <div style={styles.tile}>
      <p style={styles.tileEyebrow}>Last 7 days</p>
      <div style={styles.stripRow}>
        {days.map((d, i) => {
          const m = d.checkin ? moodByScore(d.checkin.mood_score) : null
          return (
            <div key={i} style={styles.stripCol}>
              <div style={{
                ...styles.stripDot,
                ...(m ? { background: m.color, border: 'none' } : {}),
                ...(d.isToday ? styles.stripDotToday : {}),
              }} />
              <span style={styles.stripDay}>{d.label}</span>
            </div>
          )
        })}
      </div>
      <p style={styles.helperText}>{helperFor(noticed)}</p>
    </div>
  )
}

const styles = {
  tile: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0', borderRadius: '18px',
    padding: '18px 18px 16px', boxShadow: '0 4px 16px rgba(80,50,20,0.06)',
  },
  tileLogged: { background: 'linear-gradient(180deg, #F6FAE9 0%, #ECF3D5 100%)', border: '0.5px solid #C2D49A' },
  tileEyebrow: { fontSize: '11px', color: '#854F0B', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 500, fontFamily: 'Georgia, serif', margin: '0 0 10px' },
  tileTitle: { fontSize: '20px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, lineHeight: 1.3, margin: '0 0 12px' },
  tileBody: { fontSize: '14px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 14px' },
  helperText: { fontSize: '11px', color: '#9C8C78', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: '12px 0 0', textAlign: 'center' },
  emptyTitle: { fontSize: '16px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, fontStyle: 'italic', margin: '0 0 8px' },

  cta: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1', border: 'none', borderRadius: '12px',
    fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },

  summaryRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  moodPill: { width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.12)' },
  summaryMood: { fontSize: '15px', color: '#2A1F15', fontFamily: 'Georgia, serif', fontWeight: 500, margin: '0 0 2px', lineHeight: 1.3 },
  summarySub: { fontSize: '12px', color: '#6B5C4A', fontFamily: 'Georgia, serif', fontStyle: 'italic', margin: 0, lineHeight: 1.4 },
  editBtn: { background: 'transparent', border: 'none', color: '#3B6D11', fontSize: '12px', fontStyle: 'italic', fontFamily: 'Georgia, serif', cursor: 'pointer', padding: 0 },

  stripRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '4px 2px 0' },
  stripCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', flex: 1 },
  stripDot: { width: '22px', height: '22px', borderRadius: '50%', background: '#F4ECDD', border: '1px dashed #DCCFB8' },
  stripDotToday: { boxShadow: '0 0 0 2px #FAF7F1, 0 0 0 3.5px #C8A86A' },
  stripDay: { fontSize: '10px', color: '#9C8C78', fontFamily: 'Georgia, serif' },
}