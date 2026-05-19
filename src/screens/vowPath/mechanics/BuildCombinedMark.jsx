import BuildPositionMap2D from './BuildPositionMap2D'
import BuildTextureMultiPick from './BuildTextureMultiPick'

export default function BuildCombinedMark({
  value,
  onChange,
  isWritable = true,
  positionConfig = {},
  textureConfig = {},
  priorEntries = [],
}) {
  const position = value?.position || null
  const textures = value?.textures || []

  const updatePosition = (newPos) => {
    onChange({ position: newPos, textures })
  }

  const updateTextures = (newTextures) => {
    onChange({ position, textures: newTextures })
  }

  // Extract ghost data from prior entries.
  // priorEntries shape: [{day, content: {a: {position, textures}, b, c, notes}}, ...]
  // We only care about activity A (the combined_mark itself).
  const positionGhosts = priorEntries
    .map(entry => {
      const pos = entry.content?.a?.position
      if (!pos) return null
      if (typeof pos.x !== 'number' || typeof pos.y !== 'number') return null
      return { day: entry.day, x: pos.x, y: pos.y }
    })
    .filter(Boolean)

  const textureGhosts = priorEntries
    .map(entry => {
      const tex = entry.content?.a?.textures
      if (!Array.isArray(tex) || tex.length === 0) return null
      return { day: entry.day, textures: tex }
    })
    .filter(Boolean)

  return (
    <div style={styles.container}>

      {/* Position sub-activity */}
      <div style={styles.section}>
        {positionConfig.subtitle && (
          <p style={styles.subtitle}>{positionConfig.subtitle}</p>
        )}
        <BuildPositionMap2D
          value={position}
          onChange={updatePosition}
          isWritable={isWritable}
          axisX={positionConfig.axisX}
          axisY={positionConfig.axisY}
          ghosts={positionGhosts}
        />
      </div>

      {/* Divider */}
      <div style={styles.divider}></div>

      {/* Textures sub-activity */}
      <div style={styles.section}>
        {textureConfig.subtitle && (
          <p style={styles.subtitle}>{textureConfig.subtitle}</p>
        )}
        <BuildTextureMultiPick
          value={textures}
          onChange={updateTextures}
          isWritable={isWritable}
          options={textureConfig.options}
          exactCount={textureConfig.exactCount}
          ghosts={textureGhosts}
        />
      </div>

    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  section: {
    width: '100%',
  },
  subtitle: {
    fontSize: '13px',
    color: '#6B5C4A',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    lineHeight: 1.5,
    margin: '0 0 1rem',
    textAlign: 'center',
  },
  divider: {
    height: '0.5px',
    background: '#EFE7D7',
    width: '60%',
    margin: '0.5rem auto',
  },
}