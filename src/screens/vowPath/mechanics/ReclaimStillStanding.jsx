import { useState, useRef, useMemo } from 'react'

const UNIVERSAL_ITEMS = [
  'Your name, written somewhere nearby.',
  'Your breath — still continuing.',
  'The reason you opened this app today.',
  'Something you knew yesterday that\'s still true.',
  'Today is one day, with a beginning and an end.',
  'Tomorrow, already on the way.',
]

const ITEM_W = 200
const ITEM_H = 44

// Try to extract a meaningful one-liner from artifact content.
// Best-effort across unknown field names; trims to one line.
function extractFromContent(content, candidateKeys) {
  if (!content || typeof content !== 'object') return null
  // direct fields
  for (const k of candidateKeys) {
    const v = content[k]
    if (typeof v === 'string' && v.trim().length > 0) return v.trim().split('\n')[0].slice(0, 80)
  }
  // nested one level
  for (const val of Object.values(content)) {
    if (val && typeof val === 'object') {
      for (const k of candidateKeys) {
        const v = val[k]
        if (typeof v === 'string' && v.trim().length > 0) return v.trim().split('\n')[0].slice(0, 80)
      }
    }
  }
  return null
}

function buildPersonalizedItems(priorArtifacts) {
  // Returns the 6 items, with personalization where available, universal fallback per slot.
  const reflectArts = priorArtifacts.filter(a => a.stage === 'reflect')
  const commitArts = priorArtifacts.filter(a => a.stage === 'commit')
  const buildArts = priorArtifacts.filter(a => a.stage === 'build')

  let reason = null
  for (const a of reflectArts) {
    reason = extractFromContent(a.content, ['reason', 'why', 'response', 'text', 'answer'])
    if (reason) break
  }

  let practice = null
  for (const a of commitArts) {
    practice = extractFromContent(a.content, ['practice', 'practice_name', 'name', 'response', 'text'])
    if (practice) break
  }

  let statement = null
  for (const a of buildArts) {
    statement = extractFromContent(a.content, ['statement', 'identity', 'identity_statement', 'response', 'text'])
    if (statement) break
  }

  return [
    UNIVERSAL_ITEMS[0],  // name — universal works
    UNIVERSAL_ITEMS[1],  // breath — universal works
    reason ? `Your reason from Reflect: ${reason}` : UNIVERSAL_ITEMS[2],
    practice ? `Your practice from Commit: ${practice}` : UNIVERSAL_ITEMS[3],
    statement ? `Your statement from Build: ${statement}` : UNIVERSAL_ITEMS[4],
    UNIVERSAL_ITEMS[5],  // tomorrow — universal works
  ]
}

export default function ReclaimStillStanding({
  existingData,
  onSave,
  saving,
  priorArtifacts = [],
}) {
  const hasExisting = !!(existingData?.items_revealed && existingData?.selected_anchor)

  const items = useMemo(() => buildPersonalizedItems(priorArtifacts), [priorArtifacts])

  const [stage, setStage] = useState(hasExisting ? 'review' : 'reveal')
  const [revealed, setRevealed] = useState(existingData?.items_revealed || [])
  const [anchorIdx, setAnchorIdx] = useState(
    existingData?.selected_anchor?.index != null ? existingData.selected_anchor.index : null
  )
  const svgRef = useRef(null)
  const startTimeRef = useRef(Date.now())

  const clientToSvg = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * 320,
      y: ((clientY - rect.top) / rect.height) * 420,
    }
  }

  const handleSvgClick = (e) => {
    if (!svgRef.current) return
    if (stage !== 'reveal') return
    if (revealed.length >= items.length) return

    const { x, y } = clientToSvg(e.clientX, e.clientY)

    // Clamp x/y so item stays inside the canvas
    const cx = Math.max(ITEM_W / 2 + 8, Math.min(320 - ITEM_W / 2 - 8, x))
    const cy = Math.max(ITEM_H / 2 + 8, Math.min(420 - ITEM_H / 2 - 8, y))

    const idx = revealed.length
    const newItem = {
      index: idx,
      item_text: items[idx],
      position: { x: cx, y: cy },
      timestamp: Date.now(),
      source: items[idx] === UNIVERSAL_ITEMS[idx] ? 'universal' : 'vow_artifact',
    }
    setRevealed(prev => [...prev, newItem])
  }

  const handleItemTap = (idx, e) => {
    if (stage !== 'anchor') return
    e.stopPropagation()
    setAnchorIdx(idx)
  }

  const handleContinueToAnchor = () => {
    setStage('anchor')
  }

  const handleSaveAnchor = () => {
    const anchor = revealed[anchorIdx]
    onSave({
      items_revealed: revealed,
      selected_anchor: {
        index: anchorIdx,
        item_text: anchor.item_text,
        position: anchor.position,
        source: anchor.source,
      },
      timestamp_started: new Date(startTimeRef.current).toISOString(),
      timestamp_completed: new Date().toISOString(),
      total_duration_ms: Date.now() - startTimeRef.current,
    })
  }

  const handleReviewContinue = () => {
    onSave(existingData)
  }

  if (stage === 'review') {
    return (
      <div style={styles.container}>
        <div style={styles.reviewBox}>
          <p style={styles.reviewLabel}>Day 3 · Completed</p>
          <p style={styles.reviewBody}>
            You surfaced six things still here. You marked your anchor.
          </p>
          {existingData?.selected_anchor?.item_text && (
            <p style={styles.reviewAnchor}>
              "{existingData.selected_anchor.item_text}"
            </p>
          )}
        </div>
        <button
          onClick={handleReviewContinue}
          disabled={saving}
          style={{
            ...styles.continueBtn,
            ...(saving ? styles.btnDisabled : {}),
          }}
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    )
  }

  const instructionText = (() => {
    if (stage === 'reveal' && revealed.length === 0) return 'Tap anywhere on the cream. Something is going to appear there.'
    if (stage === 'reveal' && revealed.length < items.length) return `Tap again. ${items.length - revealed.length} more.`
    if (stage === 'reveal') return 'All six are here.'
    if (stage === 'anchor') return 'Of the six, which feels most solid right now? Tap it.'
    return ''
  })()

  return (
    <div style={styles.container}>
      <p style={styles.stepLabel}>
        {stage === 'anchor' ? 'Act 2 · The anchor' : 'Act 1 · What\'s still here'}
      </p>

      <svg
        ref={svgRef}
        viewBox="0 0 320 420"
        style={styles.svg}
        onClick={handleSvgClick}
      >
        {revealed.map((item, i) => {
          const isAnchor = stage === 'anchor' && anchorIdx === i
          const isDimmed = stage === 'anchor' && anchorIdx != null && anchorIdx !== i
          return (
            <g
              key={i}
              onClick={(e) => handleItemTap(i, e)}
              style={{ cursor: stage === 'anchor' ? 'pointer' : 'default' }}
            >
              <rect
                x={item.position.x - ITEM_W / 2}
                y={item.position.y - ITEM_H / 2}
                width={ITEM_W}
                height={ITEM_H}
                rx="10"
                fill={isAnchor ? '#C5572C' : '#FDF1E4'}
                stroke={isAnchor ? '#A8421E' : '#E0CDB3'}
                strokeWidth={isAnchor ? '1.5' : '0.5'}
                opacity={isDimmed ? 0.35 : 1}
              />
              <text
                x={item.position.x}
                y={item.position.y + 4}
                textAnchor="middle"
                fontFamily="Georgia, serif"
                fontStyle="italic"
                fontSize="11"
                fill={isAnchor ? '#FAF7F1' : '#2A1F15'}
                opacity={isDimmed ? 0.5 : 1}
                style={{ pointerEvents: 'none' }}
              >
                {item.item_text.length > 38 ? item.item_text.slice(0, 36) + '…' : item.item_text}
              </text>
            </g>
          )
        })}
      </svg>

      <p style={styles.instruction}>{instructionText}</p>

      {stage === 'reveal' && revealed.length >= items.length && (
        <button onClick={handleContinueToAnchor} style={styles.primaryBtn}>
          Continue
        </button>
      )}

      {stage === 'anchor' && anchorIdx != null && (
        <button
          onClick={handleSaveAnchor}
          disabled={saving}
          style={{
            ...styles.primaryBtn,
            ...(saving ? styles.btnDisabled : {}),
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      )}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    alignItems: 'center',
    paddingBottom: '1rem',
    width: '100%',
  },
  stepLabel: {
    fontSize: '10px',
    color: '#854F0B',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    margin: '0 0 0.25rem',
    alignSelf: 'flex-start',
  },
  svg: {
    width: '100%',
    maxWidth: '320px',
    aspectRatio: '320 / 420',
    background: '#FDFBF6',
    borderRadius: '20px',
    border: '0.5px solid #EFE7D7',
    cursor: 'crosshair',
    touchAction: 'manipulation',
    userSelect: 'none',
  },
  instruction: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: 0,
    lineHeight: 1.5,
    maxWidth: '320px',
    minHeight: '40px',
  },
  primaryBtn: {
    padding: '12px 32px',
    background: 'linear-gradient(180deg, #3A2A1C 0%, #241710 100%)',
    color: '#FAF7F1',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    boxShadow: '0 4px 14px rgba(40,25,10,0.25)',
  },
  reviewBox: {
    background: '#FDFBF6',
    border: '0.5px solid #EFE7D7',
    borderRadius: '16px',
    padding: '1.5rem 1.25rem',
    textAlign: 'center',
    width: '100%',
  },
  reviewLabel: {
    fontSize: '10px',
    color: '#3B6D11',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontWeight: 500,
    margin: '0 0 1rem',
  },
  reviewBody: {
    fontSize: '15px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0 0 1rem',
  },
  reviewAnchor: {
    fontSize: '13px',
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    margin: 0,
    lineHeight: 1.5,
  },
  continueBtn: {
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
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}