import { useState, useEffect } from 'react'

export default function CostRanker({
  costs,
  existingData,
  onSave,
  saving,
}) {
  // Order is an array of cost IDs in current rank order (index 0 = #1)
  const [order, setOrder] = useState(costs.map(c => c.id))

  useEffect(() => {
    if (existingData?.ranking && Array.isArray(existingData.ranking)) {
      // Validate that all expected costs are present
      const validIds = new Set(costs.map(c => c.id))
      const existingIds = existingData.ranking.filter(id => validIds.has(id))
      if (existingIds.length === costs.length) {
        setOrder(existingIds)
      }
    }
  }, [existingData, costs])

  const moveUp = (index) => {
    if (index === 0) return
    const next = [...order]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    setOrder(next)
  }

  const moveDown = (index) => {
    if (index === order.length - 1) return
    const next = [...order]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    setOrder(next)
  }

  const handleSave = () => {
    onSave({
      ranking: order,
      ranking_with_metadata: order.map((id, idx) => ({
        rank: idx + 1,
        cost_id: id,
        label: costs.find(c => c.id === id)?.label,
      })),
    })
  }

  const getCost = (id) => costs.find(c => c.id === id)

  return (
    <div>
      <h2 style={styles.header}>Rank the costs.</h2>
      <p style={styles.subtext}>
        Use the arrows to move each cost up or down. The one at the top is the cost that, when you think honestly, matters most to you.
      </p>

      <div style={styles.list}>
        {order.map((costId, index) => {
          const cost = getCost(costId)
          if (!cost) return null
          const rank = index + 1
          const isFirst = index === 0
          const isLast = index === order.length - 1

          return (
            <div key={cost.id} style={styles.row}>
              <div style={styles.rankBadge}>
                <span style={styles.rankNumber}>{rank}</span>
              </div>

              <div style={styles.content}>
                <p style={styles.label}>{cost.label}</p>
                <p style={styles.description}>{cost.description}</p>
              </div>

              <div style={styles.arrows}>
                <button
                  onClick={() => moveUp(index)}
                  disabled={isFirst}
                  style={{
                    ...styles.arrowBtn,
                    ...(isFirst ? styles.arrowBtnDisabled : {}),
                  }}
                  aria-label="Move up"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={isLast}
                  style={{
                    ...styles.arrowBtn,
                    ...(isLast ? styles.arrowBtnDisabled : {}),
                  }}
                  aria-label="Move down"
                >
                  ▼
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <p style={styles.note}>
        {existingData ? 'You can adjust the order, then save.' : 'Reorder until it feels true. Then save.'}
      </p>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          ...styles.saveBtn,
          ...(saving ? styles.saveBtnDisabled : {}),
        }}
      >
        {saving ? 'Saving...' : 'Save & continue'}
      </button>
    </div>
  )
}

const styles = {
  header: {
    fontSize: '22px',
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    fontWeight: 500,
    lineHeight: 1.3,
    margin: '0 0 0.75rem',
  },
  subtext: {
    fontSize: '14px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.6,
    margin: '0 0 1.5rem',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '1.25rem',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    background: 'white',
    border: '0.5px solid #E8DFD0',
    borderRadius: '14px',
    boxShadow: '0 2px 6px rgba(80,50,20,0.04)',
  },
  rankBadge: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(180deg, #F4ECDD 0%, #EDDFC2 100%)',
    border: '0.5px solid #DDCFB6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rankNumber: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#854F0B',
    fontFamily: 'Georgia, serif',
    fontVariantNumeric: 'tabular-nums',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#2A1F15',
    fontFamily: 'Georgia, serif',
    margin: '0 0 3px',
    lineHeight: 1.3,
  },
  description: {
    fontSize: '12px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.4,
    margin: 0,
  },
  arrows: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flexShrink: 0,
  },
  arrowBtn: {
    width: '32px',
    height: '24px',
    background: '#FDFBF6',
    border: '0.5px solid #DDCFB6',
    borderRadius: '6px',
    color: '#854F0B',
    fontSize: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  arrowBtnDisabled: {
    color: '#DDCFB6',
    background: '#FAF7F1',
    cursor: 'not-allowed',
  },
  note: {
    fontSize: '11px',
    color: '#9C8C78',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: '0 0 1.25rem',
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