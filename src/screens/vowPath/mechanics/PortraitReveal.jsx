import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'

export default function PortraitReveal({ substance, onSave, saving }) {
  const [loading, setLoading] = useState(true)
  const [artifacts, setArtifacts] = useState({})
  const [day6Letter, setDay6Letter] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadAllArtifacts() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setError('Not signed in.')
          setLoading(false)
          return
        }

        // Load all reflect artifacts
        const { data: artifactRows } = await supabase
          .from('vow_artifacts')
          .select('*')
          .eq('user_id', user.id)
          .eq('stage', 'reflect')

        // Build a map: artifact_type → content
        const map = {}
        for (const row of (artifactRows || [])) {
          map[row.artifact_type] = row.content
        }
        setArtifacts(map)

        // Load the Day 6 letter (sealed for the past 14 days; unsealing today)
        const { data: letter } = await supabase
          .from('sealed_letters')
          .select('*')
          .eq('user_id', user.id)
          .eq('letter_key', 'reflect_day_6_letter_to_past_self')
          .maybeSingle()

        if (letter) {
          setDay6Letter(letter)
          // Mark it as unsealed in DB
          if (letter.is_sealed) {
            await supabase
              .from('sealed_letters')
              .update({
                is_sealed: false,
                unsealed_at: new Date().toISOString(),
              })
              .eq('user_id', user.id)
              .eq('letter_key', 'reflect_day_6_letter_to_past_self')
          }
        }

        setLoading(false)
      } catch (err) {
        console.error('Failed to load portrait:', err)
        setError('Could not load your portrait.')
        setLoading(false)
      }
    }
    loadAllArtifacts()
  }, [])

  const handleSave = () => {
    onSave({
      viewed_at: new Date().toISOString(),
      artifact_count_loaded: Object.keys(artifacts).length,
    })
  }

  if (loading) {
    return (
      <div style={styles.loadingState}>
        <p>Surfacing your work...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.loadingState}>
        <p style={{ color: '#854F0B' }}>{error}</p>
      </div>
    )
  }

  // ---- Extract specific artifacts ----
  const TRIGGER_LABEL = { stress: 'Stress', boredom: 'Boredom', loneliness: 'Loneliness', anger: 'Anger', anxiety: 'Anxiety', sadness: 'Sadness', avoidance: 'Avoidance', sleep: 'Sleep', time_of_day: 'A time of day', habit: 'Habit / routine', people: 'Certain people', places: 'Certain places', celebration: 'Celebration', sex: 'Sex / intimacy' }
  const DURATION_BAND_LABEL = { less_than_6_months: 'Under 6 months', '6_to_12_months': '6–12 months', '1_to_3_years': '1–3 years', '3_to_5_years': '3–5 years', '5_to_10_years': '5–10 years', more_than_10_years: '10+ years' }
    const day1 = artifacts['reflect_day_1_arrival']
  const day2 = artifacts['reflect_day_2_landscape']
  const day3 = artifacts['reflect_day_3_triggers']
  const day4 = artifacts['reflect_day_4_truth_sort']
  const day5 = artifacts['reflect_day_5_time_money']
  const day8 = artifacts['reflect_day_8_cost_ranking']
  const day9 = artifacts['reflect_day_9_body_map']
  const day10 = artifacts['reflect_day_10_halfway']
  const day11 = artifacts['reflect_day_11_two_futures']
  const day12 = artifacts['reflect_day_12_using_voice']
  const day13 = artifacts['reflect_day_13_stories']
  const day15 = artifacts['reflect_day_15_outcomes']
  const day16 = artifacts['reflect_day_16_fears']
  const day18 = artifacts['reflect_day_18_readiness']
  const day19 = artifacts['reflect_day_19_what_ready_means']

  const formatIndianCurrency = (num) => {
    if (!num) return '—'
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} crore`
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} lakh`
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)},000`
    return `₹${num}`
  }

  return (
    <div>
      <p style={styles.portraitIntro}>
        Three weeks of looking, in your own voice.
      </p>

      {/* ===== WEEK 1: SEE IT ===== */}
      <div style={styles.weekHeader}>
        <p style={styles.weekLabel}>Week 1</p>
        <h3 style={styles.weekTitle}>What you saw</h3>
      </div>

      {/* Day 1 — What brought you here (quoted reasons) */}
      {(day1?.selected_chip_objects?.length > 0 || day1?.selected_chips?.length > 0 || day1?.custom_chips?.length > 0) && (
        <PortraitSection label="Day 1" title="What brought you here">
          <div style={styles.quotedReasonsBlock}>
            {(day1?.selected_chip_objects
              || (day1?.selected_chips || []).map(c => (typeof c === 'string' ? { label: c } : c))
            )?.map((chip, i) => (
              <div key={`sel-${i}`} style={styles.quotedReason}>
                <span style={styles.quoteMark}>"</span>
                <p style={styles.quotedReasonText}>{chip.label}</p>
              </div>
            ))}
            {day1?.custom_chips?.map((label, i) => (
              <div key={`cus-${i}`} style={styles.quotedReason}>
                <span style={styles.quoteMark}>"</span>
                <p style={styles.quotedReasonText}>
                  {label}
                  <span style={styles.quotedReasonCustom}> (your own words)</span>
                </p>
              </div>
            ))}
          </div>
        </PortraitSection>
      )}

      {/* Day 2 — Landscape (number card) */}
      {day2 && (
        <PortraitSection label="Day 2" title="Your landscape">
          <div style={styles.landscapeCard}>
            <div style={styles.landscapeRow}>
              <div style={styles.landscapeStat}>
                <div style={styles.landscapeNumber}>
                  {day2.frequency_per_week || day2.days_per_week || day2.frequency || '—'}
                </div>
                <div style={styles.landscapeStatLabel}>
                  times a week
                </div>
              </div>

              {day2.amount_per_session && (
                <>
                  <div style={styles.landscapeDivider}></div>
                  <div style={styles.landscapeStat}>
                    <div style={styles.landscapeNumberSmall}>
                      {day2.amount_per_session}
                    </div>
                    <div style={styles.landscapeStatLabel}>
                      per session
                    </div>
                  </div>
                </>
              )}

              {(day2.years_pattern || day2.duration_band) && (
                <>
                  <div style={styles.landscapeDivider}></div>
                  <div style={styles.landscapeStat}>
                    {day2.years_pattern ? (
                      <>
                        <div style={styles.landscapeNumber}>{day2.years_pattern}</div>
                        <div style={styles.landscapeStatLabel}>{day2.years_pattern === 1 ? 'year' : 'years'}</div>
                      </>
                    ) : (
                      <>
                        <div style={styles.landscapeNumberSmall}>{DURATION_BAND_LABEL[day2.duration_band] || day2.duration_band}</div>
                        <div style={styles.landscapeStatLabel}>how long</div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
            <p style={styles.landscapeFooter}>
              This is the pattern, in numbers.
            </p>
          </div>
        </PortraitSection>
      )}

      {/* Day 3 — Triggers (grouped by category) */}
      {(day3?.selected_trigger_objects?.length > 0 || day3?.selected_triggers?.length > 0 || day3?.custom_triggers?.length > 0) && (
        <PortraitSection label="Day 3" title="Your trigger map">
          <TriggerGrouped
            triggers={day3?.selected_trigger_objects
              || (day3?.selected_triggers || []).map(t => (typeof t === 'string' ? { id: t, label: TRIGGER_LABEL[t] || t.replace(/_/g, ' ') } : t))}
            customs={day3?.custom_triggers || []}
          />
        </PortraitSection>
      )}

      {/* Day 4 — Truth sort (actual statements with verdicts) */}
      {day4 && (
        <PortraitSection label="Day 4" title="What you sorted as true">
          <TruthSortDisplay sorts={day4.sorts} counts={day4.counts} />
        </PortraitSection>
      )}

      {/* Day 5 — Time & money */}
      {day5 && (
        <PortraitSection label="Day 5" title="What it takes">
          <div style={styles.factCard}>
            <div style={styles.factRow}>
              <span style={styles.factLabel}>Time</span>
              <span style={styles.factValue}>
                {day5.computed_lifetime_hours?.toLocaleString() || '—'} hours
              </span>
            </div>
            <div style={styles.factRow}>
              <span style={styles.factLabel}>Money</span>
              <span style={styles.factValue}>
                {formatIndianCurrency(day5.computed_lifetime_money)}
              </span>
            </div>
            <p style={styles.factSub}>
              Computed across {day5.years_on_this} {day5.years_on_this === 1 ? 'year' : 'years'}.
            </p>
          </div>
        </PortraitSection>
      )}

      {/* Day 6 — The unsealed letter */}
      {day6Letter && (
        <PortraitSection label="Day 6" title="The letter you wrote, now unsealed">
          <div style={styles.letterCard}>
            <div style={styles.letterTopBar}>
              <span style={styles.letterUnsealedLabel}>UNSEALED TODAY</span>
              <span style={styles.letterDate}>
                Sealed {day6Letter.sealed_at
                  ? new Date(day6Letter.sealed_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })
                  : ''}
              </span>
            </div>
            <p style={styles.letterPrompt}>Dear me, before any of this:</p>
            <div style={styles.letterBody}>
              {day6Letter.letter_text.split('\n').map((line, i) => (
                <p key={i} style={styles.letterLine}>
                  {line || '\u00A0'}
                </p>
              ))}
            </div>
          </div>
        </PortraitSection>
      )}

      {/* ===== WEEK 2: FEEL IT ===== */}
      <div style={styles.weekHeader}>
        <p style={styles.weekLabel}>Week 2</p>
        <h3 style={styles.weekTitle}>What you felt</h3>
      </div>

      {/* Day 8 — Cost ranking */}
      {day8?.ranking_with_metadata && (
        <PortraitSection label="Day 8" title="What it costs you, ranked">
          <ol style={styles.rankList}>
            {day8.ranking_with_metadata.map(item => (
              <li key={item.cost_id} style={styles.rankItem}>
                <span style={styles.rankNumber}>{item.rank}</span>
                <span style={styles.rankLabel}>{item.label}</span>
              </li>
            ))}
          </ol>
        </PortraitSection>
      )}

      {/* Day 9 — Body map */}
      {day9?.zones && Object.keys(day9.zones).length > 0 && (
        <PortraitSection label="Day 9" title="What your body has been carrying">
          <div style={styles.zonesList}>
            {Object.entries(day9.zones).map(([zoneId, entry]) => (
              <div key={zoneId} style={styles.zoneItem}>
                <p style={styles.zoneId}>{zoneId.replace(/_/g, ' ')}</p>
                {entry.note && (
                  <p style={styles.zoneNote}>{entry.note}</p>
                )}
              </div>
            ))}
          </div>
        </PortraitSection>
      )}

      {/* Day 10 — Halfway check-in */}
      {day10?.option_selected && (
        <PortraitSection label="Day 10" title="The halfway check-in">
          <p style={styles.checkInText}>
            How you were doing: <strong>{halfwayLabel(day10.option_selected)}</strong>
          </p>
        </PortraitSection>
      )}

      {/* Day 11 — Two futures */}
      {day11 && (
        <PortraitSection label="Day 11" title="The future closer to your trajectory">
          <p style={styles.futureText}>
            You said this is closer:{' '}
            <strong>{day11.future_selected_title || (day11.future_selected === 'a' ? 'The continuing version' : 'The other version')}</strong>
          </p>
        </PortraitSection>
      )}

      {/* Day 12 — Using voice */}
      {day12?.total_count > 0 && (
        <PortraitSection label="Day 12" title="The using voice you recognized">
          <p style={styles.usingVoiceText}>
            <strong>{day12.total_count}</strong> of the statements have been your voice, too.
          </p>
        </PortraitSection>
      )}

      {/* Day 13 — Stories */}
      {day13 && day13.familiar_count !== undefined && (
        <PortraitSection label="Day 13" title="Stories you recognized in">
          <p style={styles.checkInText}>
            <strong>{day13.familiar_count}</strong> of {day13.total_stories || 4} stories felt familiar.
          </p>
        </PortraitSection>
      )}

      {/* ===== WEEK 3: DECIDE ===== */}
      <div style={styles.weekHeader}>
        <p style={styles.weekLabel}>Week 3</p>
        <h3 style={styles.weekTitle}>Where you actually stand</h3>
      </div>

      {/* Day 15 — Outcomes */}
      {day15?.counts && (
        <PortraitSection label="Day 15" title="How the outcomes felt">
          <p style={styles.outcomesText}>
            Of 8 possible outcomes: <strong>{day15.counts.hopeful}</strong> hopeful,{' '}
            <strong>{day15.counts.scared}</strong> scared,{' '}
            <strong>{day15.counts.neutral}</strong> neutral.
          </p>
        </PortraitSection>
      )}

      {/* Day 16 — Fears */}
      {day16?.total_count > 0 && (
        <PortraitSection label="Day 16" title="The fears you named">
          <p style={styles.fearsText}>
            <strong>{(day16.left_selected?.length || 0) + (day16.left_customs?.length || 0)}</strong> fears of stopping.{' '}
            <strong>{(day16.right_selected?.length || 0) + (day16.right_customs?.length || 0)}</strong> fears of continuing.
          </p>
        </PortraitSection>
      )}

      {/* Day 18 — Readiness */}
      {day18?.readiness_score !== undefined && (
        <PortraitSection label="Day 18" title="Your readiness rating">
          <div style={styles.readinessCard}>
            <div style={styles.readinessBig}>{day18.readiness_score}<span style={styles.readinessSmall}>/10</span></div>
            {day18.why_not_lower && (
              <div style={styles.readinessQ}>
                <p style={styles.readinessQLabel}>Why not lower:</p>
                <p style={styles.readinessQText}>{day18.why_not_lower}</p>
              </div>
            )}
            {day18.what_would_move_higher && (
              <div style={styles.readinessQ}>
                <p style={styles.readinessQLabel}>What would move it higher:</p>
                <p style={styles.readinessQText}>{day18.what_would_move_higher}</p>
              </div>
            )}
          </div>
        </PortraitSection>
      )}

      {/* Day 19 — What ready means */}
      {day19?.option_selected && (
        <PortraitSection label="Day 19" title="What ready means for you">
          <p style={styles.readyText}>
            <strong>{readyMeansLabel(day19.option_selected)}</strong>
          </p>
        </PortraitSection>
      )}

      <div style={styles.divider}></div>

      <p style={styles.closingNote}>
        This is what three weeks of looking has produced. Tomorrow, you decide what to do with it.
      </p>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          ...styles.saveBtn,
          ...(saving ? styles.saveBtnDisabled : {}),
        }}
      >
        {saving ? 'Saving...' : 'I have seen my portrait'}
      </button>
    </div>
  )
}

// ===========================================================
// Helper components
// ===========================================================

function PortraitSection({ label, title, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <span style={styles.sectionLabel}>{label}</span>
        <span style={styles.sectionTitle}>{title}</span>
      </div>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  )
}

function ChipList({ items }) {
  if (!items?.length) return null
  return (
    <div style={styles.chipWrap}>
      {items.map((label, i) => (
        <span key={i} style={styles.chip}>{label}</span>
      ))}
    </div>
  )
}

function TriggerGrouped({ triggers, customs }) {
  // Group triggers by category for visual coherence
  const EMOTIONAL_IDS = ['stress', 'boredom', 'loneliness', 'anger', 'anxiety', 'sadness']
  const SITUATIONAL_IDS = ['time_of_day', 'people', 'places', 'celebration', 'sex']
  const COPING_IDS = ['avoidance', 'sleep', 'habit']

  const emotional = triggers.filter(t => EMOTIONAL_IDS.includes(t.id))
  const situational = triggers.filter(t => SITUATIONAL_IDS.includes(t.id))
  const coping = triggers.filter(t => COPING_IDS.includes(t.id))
  const other = triggers.filter(t =>
    !EMOTIONAL_IDS.includes(t.id) &&
    !SITUATIONAL_IDS.includes(t.id) &&
    !COPING_IDS.includes(t.id)
  )

  const groups = [
    { title: 'Emotional', items: emotional, accent: '#C5572C' },
    { title: 'Situational', items: situational, accent: '#854F0B' },
    { title: 'Coping', items: coping, accent: '#7A8C5A' },
    { title: 'Other', items: other, accent: '#9C8C78' },
  ].filter(g => g.items.length > 0)

  return (
    <div style={styles.triggerGroupedWrap}>
      {groups.map(group => (
        <div key={group.title} style={styles.triggerGroup}>
          <div style={{ ...styles.triggerGroupHeader, borderLeftColor: group.accent }}>
            <span style={styles.triggerGroupTitle}>{group.title}</span>
            <span style={styles.triggerGroupCount}>{group.items.length}</span>
          </div>
          <ul style={styles.triggerList}>
            {group.items.map(t => (
              <li key={t.id} style={styles.triggerListItem}>{t.label}</li>
            ))}
          </ul>
        </div>
      ))}
      {customs.length > 0 && (
        <div style={styles.triggerGroup}>
          <div style={{ ...styles.triggerGroupHeader, borderLeftColor: '#854F0B', borderLeftStyle: 'dashed' }}>
            <span style={styles.triggerGroupTitle}>Your own</span>
            <span style={styles.triggerGroupCount}>{customs.length}</span>
          </div>
          <ul style={styles.triggerList}>
            {customs.map((c, i) => (
              <li key={i} style={{ ...styles.triggerListItem, fontStyle: 'italic' }}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function TruthSortDisplay({ sorts, counts }) {
  if (!sorts) return null

  const STATEMENTS = [
    { id: 'getting_defensive', text: 'I get defensive when someone asks about my use.' },
    { id: 'rules_broken', text: `I've made rules about my use and broken them.` },
    { id: 'others_noticed', text: 'People around me have noticed before I have.' },
    { id: 'used_for_emotion', text: 'I use to handle hard emotions.' },
    { id: 'lied_about_amount', text: `I've lied about how much I use — to someone close, or to myself.` },
    { id: 'cant_imagine_without', text: `I can't fully imagine a version of my life without it.` },
    { id: 'wanted_to_stop', text: `There have been days I've genuinely wanted to stop.` },
    { id: 'occupies_more', text: 'It occupies more of my mind than I want it to.' },
  ]

  const verdictStyle = {
    true: { bg: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)', border: '#7A8C5A', color: '#3B6D11', label: 'TRUE' },
    not_true: { bg: 'linear-gradient(180deg, #F4ECDD 0%, #F0E5D0 100%)', border: '#C5572C', color: '#854F0B', label: 'NOT TRUE' },
    not_sure: { bg: 'linear-gradient(180deg, #ECE6F4 0%, #DCD3E8 100%)', border: '#7A6B8C', color: '#5C4D70', label: 'NOT SURE' },
  }

  return (
    <div>
      <div style={styles.truthCountsRow}>
        <div style={{ ...styles.truthCountChip, ...styles.truthCountTrue }}>
          <span style={styles.truthCountNum}>{counts?.true || 0}</span>
          <span style={styles.truthCountLabel}>true</span>
        </div>
        <div style={{ ...styles.truthCountChip, ...styles.truthCountNotTrue }}>
          <span style={styles.truthCountNum}>{counts?.not_true || 0}</span>
          <span style={styles.truthCountLabel}>not true</span>
        </div>
        <div style={{ ...styles.truthCountChip, ...styles.truthCountNotSure }}>
          <span style={styles.truthCountNum}>{counts?.not_sure || 0}</span>
          <span style={styles.truthCountLabel}>not sure</span>
        </div>
      </div>

      <div style={styles.truthList}>
        {STATEMENTS.map(stmt => {
          const verdict = sorts[stmt.id]
          if (!verdict) return null
          const v = verdictStyle[verdict]
          return (
            <div key={stmt.id} style={styles.truthStatement}>
              <div
                style={{
                  ...styles.truthBadge,
                  background: v.bg,
                  borderColor: v.border,
                  color: v.color,
                }}
              >
                {v.label}
              </div>
              <p style={styles.truthStatementText}>{stmt.text}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ===========================================================
// Label helpers
// ===========================================================

function halfwayLabel(id) {
  const map = {
    steady: 'Steady. The work is landing.',
    heavier: 'Heavier than expected, still here.',
    wobbling: 'Wobbling. Not sure I can keep going.',
    detached: `Detached. The work isn't landing.`,
  }
  return map[id] || id
}

function readyMeansLabel(id) {
  const map = {
    ready_to_begin: `Ready enough to begin. I don't need to be certain.`,
    almost_ready: `Almost there. Maybe not quite yet.`,
    not_ready: `Not ready. The looking has been valuable, but I'm not at action.`,
    something_else: `Something else, that none of these quite capture.`,
  }
  return map[id] || id
}

// ===========================================================
// Styles
// ===========================================================

const styles = {
  loadingState: {
    textAlign: 'center',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    padding: '4rem 2rem',
  },
  portraitIntro: {
    fontSize: '14px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '0 0 2rem',
  },
  weekHeader: {
    marginTop: '2rem',
    marginBottom: '1.25rem',
    paddingBottom: '0.85rem',
    borderBottom: '1px solid #E8DFD0',
  },
  weekLabel: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    margin: '0 0 4px',
  },
  weekTitle: {
    fontSize: '22px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    margin: 0,
    lineHeight: 1.3,
  },
  section: {
    marginBottom: '1.5rem',
    paddingBottom: '1.25rem',
    borderBottom: '0.5px solid #EFE7D7',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '10px',
    marginBottom: '0.85rem',
  },
  sectionLabel: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  sectionTitle: {
    fontSize: '16px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    flex: 1,
  },
  sectionBody: {
    paddingLeft: '0',
  },
  chipWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  chip: {
    display: 'inline-block',
    padding: '5px 11px',
    background: '#FDFBF6',
    border: '0.5px solid #DDCFB6',
    borderRadius: '999px',
    fontSize: '12px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
  },

  // ===== Day 1 — Quoted reasons =====
  quotedReasonsBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  quotedReason: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px 14px 12px 12px',
    background: '#FDFBF6',
    borderLeft: '2px solid #C5572C',
    borderRadius: '0 12px 12px 0',
  },
  quoteMark: {
    fontSize: '32px',
    color: '#C5572C',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 0.8,
    flexShrink: 0,
    marginTop: '4px',
  },
  quotedReasonText: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.55,
    margin: 0,
    flex: 1,
  },
  quotedReasonCustom: {
    fontSize: '11px',
    color: '#9C8C78',
    fontStyle: 'normal',
    marginLeft: '6px',
  },

  // ===== Day 2 — Landscape number card =====
  landscapeCard: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '16px',
    padding: '1.5rem 1.25rem',
    boxShadow: '0 4px 14px rgba(80,50,20,0.06)',
  },
  landscapeRow: {
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    gap: '8px',
    marginBottom: '1rem',
  },
  landscapeStat: {
    flex: 1,
    textAlign: 'center',
    padding: '0 4px',
  },
  landscapeNumber: {
    fontSize: '42px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
    marginBottom: '6px',
  },
  landscapeNumberSmall: {
    fontSize: '24px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.1,
    marginBottom: '6px',
    paddingTop: '12px',
  },
  landscapeStatLabel: {
    fontSize: '11px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textTransform: 'lowercase',
    letterSpacing: '0.04em',
    lineHeight: 1.3,
  },
  landscapeDivider: {
    width: '0.5px',
    background: '#E8DFD0',
    flexShrink: 0,
  },
  landscapeFooter: {
    fontSize: '12px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: 0,
    paddingTop: '0.85rem',
    borderTop: '0.5px solid #EFE7D7',
  },

  // ===== Day 3 — Triggers grouped =====
  triggerGroupedWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  triggerGroup: {
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '12px',
    padding: '10px 14px 12px',
  },
  triggerGroupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingLeft: '8px',
    paddingBottom: '8px',
    marginBottom: '8px',
    borderLeft: '2px solid #C5572C',
    borderBottom: '0.5px solid #E8DFD0',
  },
  triggerGroupTitle: {
    fontSize: '12px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  triggerGroupCount: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    fontVariantNumeric: 'tabular-nums',
  },
  triggerList: {
    listStyle: 'none',
    margin: 0,
    padding: '0 0 0 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  triggerListItem: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.5,
  },

  // ===== Day 4 — Truth sort detail =====
  truthCountsRow: {
    display: 'flex',
    gap: '6px',
    marginBottom: '1rem',
  },
  truthCountChip: {
    flex: 1,
    padding: '8px 6px',
    borderRadius: '10px',
    border: '0.5px solid',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  truthCountTrue: {
    background: 'linear-gradient(180deg, #EAF3DE 0%, #DCE9C8 100%)',
    borderColor: '#7A8C5A',
    color: '#3B6D11',
  },
  truthCountNotTrue: {
    background: 'linear-gradient(180deg, #F4ECDD 0%, #F0E5D0 100%)',
    borderColor: '#C5572C',
    color: '#854F0B',
  },
  truthCountNotSure: {
    background: 'linear-gradient(180deg, #ECE6F4 0%, #DCD3E8 100%)',
    borderColor: '#7A6B8C',
    color: '#5C4D70',
  },
  truthCountNum: {
    fontSize: '20px',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
  },
  truthCountLabel: {
    fontSize: '10px',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textTransform: 'lowercase',
    letterSpacing: '0.04em',
  },
  truthList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  truthStatement: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '10px 12px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '10px',
  },
  truthBadge: {
    flexShrink: 0,
    padding: '3px 7px',
    borderRadius: '5px',
    border: '0.5px solid',
    fontSize: '9px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    lineHeight: 1.4,
    marginTop: '2px',
    minWidth: '58px',
    textAlign: 'center',
  },
  truthStatementText: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.55,
    margin: 0,
    flex: 1,
  },

  // ===== Day 5 — Time & money fact card =====
  factCard: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '1rem 1.25rem',
    boxShadow: '0 2px 8px rgba(80,50,20,0.05)',
  },
  factRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: '6px 0',
  },
  factLabel: {
    fontSize: '12px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontWeight: 500,
  },
  factValue: {
    fontSize: '17px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  factSub: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '6px 0 0',
  },

  // ===== Day 6 — Unsealed letter =====
  letterCard: {
    background: 'linear-gradient(180deg, #FFFEF8 0%, #FDFBF6 100%)',
    border: '1px solid #C5572C',
    borderRadius: '16px',
    padding: '1.25rem',
    boxShadow: '0 4px 14px rgba(197,87,44,0.12)',
  },
  letterTopBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.85rem',
  },
  letterUnsealedLabel: {
    fontSize: '10px',
    color: '#C5572C',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 600,
  },
  letterDate: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
  },
  letterPrompt: {
    fontSize: '13px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0 0 0.85rem',
  },
  letterBody: {
    paddingTop: '0.5rem',
    borderTop: '0.5px solid #EFE7D7',
  },
  letterLine: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.7,
    margin: '0 0 0.5rem',
  },

  // ===== Day 8 — Cost ranking =====
  rankList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  rankItem: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
    padding: '6px 0',
  },
  rankNumber: {
    fontSize: '16px',
    color: '#854F0B',
    fontWeight: 500,
    fontFamily: 'Georgia, serif',
    fontVariantNumeric: 'tabular-nums',
    minWidth: '18px',
  },
  rankLabel: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
  },

  // ===== Day 9 — Body map zones =====
  zonesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  zoneItem: {
    padding: '8px 12px',
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '10px',
  },
  zoneId: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    textTransform: 'capitalize',
    margin: 0,
  },
  zoneNote: {
    fontSize: '12px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.5,
    margin: '3px 0 0',
  },

  // ===== Generic check-in / one-liner styles =====
  checkInText: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.65,
    margin: 0,
  },
  futureText: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.65,
    margin: 0,
  },
  usingVoiceText: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.65,
    margin: 0,
  },
  outcomesText: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.65,
    margin: 0,
  },
  fearsText: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.65,
    margin: 0,
  },

  // ===== Day 18 — Readiness card =====
  readinessCard: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF6 100%)',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    padding: '1.25rem',
    boxShadow: '0 2px 8px rgba(80,50,20,0.05)',
  },
  readinessBig: {
    fontSize: '40px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    margin: '0 0 0.85rem',
    lineHeight: 1,
  },
  readinessSmall: {
    fontSize: '18px',
    color: '#9C8C78',
    marginLeft: '4px',
  },
  readinessQ: {
    marginBottom: '0.75rem',
  },
  readinessQLabel: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontWeight: 500,
    margin: '0 0 4px',
  },
  readinessQText: {
    fontSize: '13px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.6,
    margin: 0,
  },
  readyText: {
    fontSize: '14px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.65,
    margin: 0,
    fontStyle: 'italic',
  },

  // ===== Closing =====
  divider: {
    height: '0.5px',
    background: '#E8DFD0',
    margin: '2rem 0 1.5rem',
  },
  closingNote: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 1.6,
    margin: '0 0 1.75rem',
    maxWidth: '320px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  saveBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  saveBtnDisabled: {
    background: '#C9B894',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
}