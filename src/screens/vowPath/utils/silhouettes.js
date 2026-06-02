import { useState, useEffect, useRef } from 'react'

// =====================================================================
// WATERCOLOUR SILHOUETTE CONFIG
// =====================================================================
// Drop the generated images into the app's public folder as:
//     /public/silhouettes/{stage}-{n}.png        (n is 1-indexed)
// e.g. /public/silhouettes/reflect-1.png ... reflect-9.png
//
// `count` = how many variants exist for that stage. Set it to exactly how
// many you generate. The overview rotates through them on each arrival;
// the path map shows variant 1 faintly behind the stage's section.
//
// `tint` = the stage's watercolour wash (from the locked palette). It is
// used only as a soft colour fallback while an image is missing/loading,
// so the screen never looks broken before the WebPs are in place.
// (If you'd rather these match the warmer accents already on the path map,
//  change the six tints here — this is the single source of truth.)
// =====================================================================

export const STAGE_SILHOUETTES = {
  notice:  { count: 3, tint: '#9FB0B5' }, // first light
  reflect: { count: 9, tint: '#C28C76' }, // golden hour
  commit:  { count: 5, tint: '#6C7689' }, // twilight
  endure:  { count: 9, tint: '#8E957C' }, // steady ground
  build:   { count: 5, tint: '#7C8757' }, // living green
  reclaim: { count: 3, tint: '#DBB394' }, // warm dawn
}

export const SILHOUETTE_INK = '#6B4A1C'

// File extension for the silhouette images. Must match your files' case exactly
// (Vercel/Linux is case-sensitive). Set to 'png' to match your current exports.
const EXT = 'png'

export function silhouetteSrc(stage, n) {
  return `/silhouettes/${stage}-${n}.${EXT}`
}

// Cycle through the variants in order on each arrival (1 -> 2 -> 3 -> 1 ...), so a
// different image shows every time the user lands on the stage. The last index is
// remembered per-stage in localStorage; safe if it's unavailable.
export function pickStageVariant(stage) {
  const cfg = STAGE_SILHOUETTES[stage]
  if (!cfg || cfg.count < 1) return null
  if (cfg.count === 1) return 1
  let last = 0
  try { last = parseInt(localStorage.getItem(`vow_sil_${stage}`) || '0', 10) || 0 } catch (e) {}
  const n = (last % cfg.count) + 1
  try { localStorage.setItem(`vow_sil_${stage}`, String(n)) } catch (e) {}
  return n
}

// The stage visual is an absolute-fill layer inside a relative "hero" wrapper at
// the top of the overview (the wrapper owns height + full-bleed). This returns
// only the paint: the v4 monochrome image framed near its TOP (where the interest
// sits) and dissolving at its bottom edge into the cream page via a mask.
//   IMAGE_FOCUS — which part of the picture the hero frames (v4 = interest up top).
//   FADE        — where the bottom dissolve begins.
const IMAGE_FOCUS = 'center 26%'
const FADE = 'linear-gradient(to bottom, #000 0%, #000 75%, transparent 100%)'

export function useStageBackground(stage) {
  const cfg = STAGE_SILHOUETTES[stage]
  const [url, setUrl] = useState(null)
  const picked = useRef(false)
  useEffect(() => {
    if (picked.current) return // guard dev StrictMode's double-invoke
    picked.current = true
    const n = pickStageVariant(stage)
    if (n) setUrl(silhouetteSrc(stage, n))
  }, [stage])
  if (!cfg) return { display: 'none' }
  const tint = `linear-gradient(180deg, ${cfg.tint}30 0%, ${cfg.tint}14 100%)`
  const common = {
    position: 'absolute',
    inset: 0,
    WebkitMaskImage: FADE,   // dissolve the bottom edge into the cream page
    maskImage: FADE,
    backgroundRepeat: 'no-repeat',
  }
  if (!url) {
    return { ...common, backgroundImage: tint, backgroundSize: 'cover' }
  }
  return {
    ...common,
    backgroundImage: `url('${url}'), ${tint}`,
    backgroundSize: 'cover, cover',
    backgroundPosition: `${IMAGE_FOCUS}, center`,
    backgroundRepeat: 'no-repeat, no-repeat',
  }
}