import { useState, useMemo } from 'react'
import { STAGE_SILHOUETTES, silhouetteSrc, pickStageVariant } from './utils/silhouettes'

// Decorative, non-interactive watercolour silhouette.
//   mode="map"      -> faint tint behind a stage's row in the path map
//                      (host element must be position:relative)
//   mode="overview" -> full-width immersive hero banner at the top of a stage's
//                      overview, fading into the page below. Rotates per arrival.
export default function StageSilhouette({ stage, mode = 'overview', variant }) {
  const cfg = STAGE_SILHOUETTES[stage]
  const isMap = mode === 'map'

  const n = useMemo(() => {
    if (variant) return variant
    if (!cfg || !cfg.count) return null
    return isMap ? 1 : pickStageVariant(stage)
  }, [stage, isMap, variant])

  const [ok, setOk] = useState(true)
  if (!cfg) return null

  // ---- MAP: faint tint behind a stage row ----
  if (isMap) {
    return (
      <div
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -1, borderRadius: 'inherit' }}
      >
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(120% 95% at 94% 50%, ${cfg.tint}24 0%, transparent 62%)` }} />
        {n && ok && (
          <img
            src={silhouetteSrc(stage, n)} alt="" loading="lazy" decoding="async" onError={() => setOk(false)}
            style={{ position: 'absolute', right: '-4%', top: '50%', transform: 'translateY(-50%)', height: '128%', width: 'auto', opacity: 0.12, objectFit: 'contain' }}
          />
        )}
      </div>
    )
  }

  // ---- OVERVIEW: full-width hero banner that dissolves into the page ----
  const fade = 'linear-gradient(180deg, #000 0%, #000 58%, transparent 100%)'
  return (
    <div
      aria-hidden="true"
      style={{ position: 'relative', width: '100%', height: 'clamp(180px, 32vh, 260px)', overflow: 'hidden', flexShrink: 0 }}
    >
      {/* colour wash underneath — fallback while loading or if the image is missing */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${cfg.tint}66 0%, ${cfg.tint}1f 55%, transparent 100%)` }} />
      {n && ok && (
        <img
          src={silhouetteSrc(stage, n)} alt="" loading="eager" decoding="async" onError={() => setOk(false)}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center 35%',
            WebkitMaskImage: fade, maskImage: fade,
          }}
        />
      )}
    </div>
  )
}