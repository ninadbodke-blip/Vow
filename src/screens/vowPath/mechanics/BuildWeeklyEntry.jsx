import { useState } from 'react'
import { getTodayDateKey } from '../data/buildContent'
import BuildPositionMap2D from './BuildPositionMap2D'
import BuildTextureMultiPick from './BuildTextureMultiPick'
import BuildDayTimelinePick from './BuildDayTimelinePick'
import BuildChipMultiPick from './BuildChipMultiPick'
import BuildSingleSelect from './BuildSingleSelect'
import BuildPairPick from './BuildPairPick'
import BuildDailySingleSelect from './BuildDailySingleSelect'
import BuildPairSequential from './BuildPairSequential'
import BuildTwoStepBranching from './BuildTwoStepBranching'
import BuildClosenessLadder from './BuildClosenessLadder'
import BuildSingleSelectFreeText from './BuildSingleSelectFreeText'
import BuildBinaryRowPicks from './BuildBinaryRowPicks'
import BuildCombinedMark from './BuildCombinedMark'

const SUB_ACTIVITY_COMPONENTS = {
  position_map_2d: BuildPositionMap2D,
  texture_multi_pick: BuildTextureMultiPick,
  day_timeline_pick: BuildDayTimelinePick,
  chip_multi_pick: BuildChipMultiPick,
  single_select: BuildSingleSelect,
  pair_pick: BuildPairPick,
  daily_single_select: BuildDailySingleSelect,
  pair_sequential: BuildPairSequential,
  two_step_branching: BuildTwoStepBranching,
  closeness_ladder: BuildClosenessLadder,
  single_select_freetext: BuildSingleSelectFreeText,
  binary_row_picks: BuildBinaryRowPicks,
  combined_mark: BuildCombinedMark,
}

export default function BuildWeeklyEntry({
  weekLabel,
  activityA,
  activityB,
  activityC,
  notes: notesConfig,
  existingData,
  onSave,
  saving,
  isCurrentEntry,
  priorEntries,
}) {
  const initial = existingData || {}
  const [a, setA] = useState(initial.a || null)
  const [b, setB] = useState(initial.b || [])
  const [c, setC] = useState(initial.c || {})
  const [notesText, setNotesText] = useState(initial.notes || '')

  const todayKey = getTodayDateKey()
  const todayC = c[todayKey] ?? null

  const handleCChange = (value) => {
    setC(prev => ({ ...prev, [todayKey]: value }))
  }

  const handleSave = () => {
    onSave({ a, b, c, notes: notesText })
  }

  const ActivityAComponent = activityA ? SUB_ACTIVITY_COMPONENTS[activityA.type] : null
  const ActivityBComponent = activityB ? SUB_ACTIVITY_COMPONENTS[activityB.type] : null
  const ActivityCComponent = activityC ? SUB_ACTIVITY_COMPONENTS[activityC.type] : null

  return (
    <div style={styles.container}>

      <div style={styles.headerBlock}>
        <p style={styles.weekLabel}>{weekLabel}</p>
        <p style={styles.headerNote}>Mark what's true. Skip what isn't.</p>
      </div>

      {ActivityAComponent && (
        <div style={styles.activityBlock}>
          <p style={styles.activityLabel}>A · Weekly</p>
          <h3 style={styles.activityTitle}>{activityA.title}</h3>
          <p style={styles.activityPrompt}>{activityA.prompt}</p>
          <ActivityAComponent
            {...activityA}
            value={a}
            onChange={setA}
            isWritable={true}
            priorEntries={priorEntries}
          />
        </div>
      )}

      {ActivityBComponent && (
        <div style={styles.activityBlock}>
          <p style={styles.activityLabel}>B · Weekly</p>
          <h3 style={styles.activityTitle}>{activityB.title}</h3>
          <p style={styles.activityPrompt}>{activityB.prompt}</p>
          <ActivityBComponent
            {...activityB}
            value={b}
            onChange={setB}
            isWritable={true}
          />
        </div>
      )}

      {ActivityCComponent && (
        <div style={styles.activityBlock}>
          <p style={styles.activityLabel}>C · Daily, optional</p>
          <h3 style={styles.activityTitle}>{activityC.title}</h3>
          <p style={styles.activityPrompt}>{activityC.prompt}</p>
          <ActivityCComponent
            {...activityC}
            value={todayC}
            onChange={handleCChange}
            isWritable={isCurrentEntry}
            allMarks={c}
            todayKey={todayKey}
          />
          {!isCurrentEntry && (
            <p style={styles.activityHint}>
              Daily marks are only writable during this entry's current week.
            </p>
          )}
        </div>
      )}

      {notesConfig && (
        <div style={styles.activityBlock}>
          <p style={styles.activityLabel}>Notes · Optional</p>
          <textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder={notesConfig.placeholder}
            style={styles.notesField}
            rows={4}
          />
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          ...styles.saveBtn,
          ...(saving ? styles.saveBtnDisabled : {}),
        }}
      >
        {saving ? 'Saving...' : (existingData ? 'Update' : 'Save')}
      </button>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    paddingBottom: '1rem',
  },
  headerBlock: {
    textAlign: 'center',
    marginBottom: '0.25rem',
    paddingBottom: '1.25rem',
    borderBottom: '0.5px solid #EFE7D7',
  },
  weekLabel: {
    fontSize: '11px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    margin: '0 0 0.4rem',
  },
  headerNote: {
    fontSize: '13px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
  },
  activityBlock: {
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '16px',
    padding: '1.25rem 1.1rem',
  },
  activityLabel: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    margin: '0 0 0.5rem',
  },
  activityTitle: {
    fontSize: '18px',
    fontWeight: 500,
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: '0 0 0.4rem',
    lineHeight: 1.3,
  },
  activityPrompt: {
    fontSize: '13.5px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.55,
    margin: '0 0 1.25rem',
  },
  activityHint: {
    fontSize: '12px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: '0.75rem 0 0',
  },
  notesField: {
    width: '100%',
    padding: '0.75rem 0.85rem',
    fontSize: '14px',
    fontFamily: 'Georgia, serif',
    color: '#2A1F15',
    background: '#FAF7F1',
    border: '0.5px solid #E8DFD0',
    borderRadius: '10px',
    resize: 'vertical',
    boxShadow: 'inset 0 1px 3px rgba(80,50,20,0.05)',
    lineHeight: 1.55,
    outline: 'none',
    fontStyle: 'italic',
    boxSizing: 'border-box',
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
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
    marginTop: '0.25rem',
  },
  saveBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}