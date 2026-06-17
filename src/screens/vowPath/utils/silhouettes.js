import { useState, useEffect, useRef } from 'react'

// =====================================================================
// STAGE BACKGROUND CONFIG (sumi-e ink wash)
// =====================================================================
// Drop the generated images into the app's public folder as:
//     /public/silhouettes/{stage}-{n}.webp       (n is 1-indexed)
// e.g. /public/silhouettes/reflect-1.webp ... reflect-9.webp
//
// `count` = how many variants exist for that stage. Set it to exactly how
// many you generate. The overview rotates through them on each arrival.
//
// `tint` = stage accent colour. Kept here as the single source of truth
// for any UI that wants a per-stage hue (path map, accents, etc.).
// It is NO LONGER applied as an image overlay — the images are
// monochrome sumi-e ink on cream and need no colour wash.
// =====================================================================

export const STAGE_SILHOUETTES = {
  notice:  { count: 3, tint: '#9FB0B5' }, // first light
  reflect: { count: 5, tint: '#C28C76' }, // golden hour
  commit:  { count: 5, tint: '#6C7689' }, // twilight
  endure:  { count: 5, tint: '#8E957C' }, // steady ground
  build:   { count: 5, tint: '#7C8757' }, // living green
  reclaim: { count: 3, tint: '#DBB394' }, // warm dawn
}

export const SILHOUETTE_INK = '#6B4A1C'

// File extension for the silhouette images. Must match your files' case exactly
// (Vercel/Linux is case-sensitive). Images are now exported as .webp.
const EXT = 'webp'

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
// the top of the overview (the wrapper owns height + full-bleed). Returns only
// the paint: the sumi-e image framed near its TOP (where the ink sits) and
// dissolving at its bottom edge into the cream page via a mask.
//   IMAGE_FOCUS — which part of the picture the hero frames (ink interest up top).
//   FADE        — where the bottom dissolve begins.
const IMAGE_FOCUS = 'center 0%'
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
  // No tint overlay — sumi-e images are monochrome black on cream, no colour wash needed.
  // While the image is loading, return nothing (cream background shows through cleanly).
  if (!url) return { display: 'none' }
  return {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url('${url}')`,
    backgroundSize: 'contain',
    backgroundPosition: 'center top',
    backgroundRepeat: 'no-repeat',
  }
}