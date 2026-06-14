import { useEffect } from 'react'

// =====================================================================
// useSeo — set per-page <title> + meta tags for a client-rendered page.
// =====================================================================
// Vow's marketing/blog pages are client-rendered (SPA). Modern Googlebot
// executes JS and indexes the resulting DOM, including title/meta set here,
// so this is enough for these pages to rank — especially the lower-competition
// long-tail queries the blog targets. (A future move to static prerendering
// would make this bulletproof, but it is not required for indexing.)
//
// Usage, at the top of a page component:
//   useSeo({
//     title: 'Why Day 3 of Quitting Vaping Is the Hardest | Vow',
//     description: 'A calm, honest look at why day three…',
//     canonical: 'https://vowapp.in/quit-vaping-day-3',
//   })
//
// It upserts tags (creates them if absent, updates if present) and restores
// the default title on unmount so navigating away doesn't leave a stale title.
// =====================================================================

const DEFAULT_TITLE = 'Vow'

function upsertMeta(attr, key, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  if (!href) return
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export default function useSeo({ title, description, canonical, image, type = 'article' }) {
  useEffect(() => {
    if (title) document.title = title

    upsertMeta('name', 'description', description)

    // Open Graph (link previews on social shares)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', type)
    if (canonical) upsertMeta('property', 'og:url', canonical)
    if (image) upsertMeta('property', 'og:image', image)

    // Twitter card
    upsertMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary')
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)
    if (image) upsertMeta('name', 'twitter:image', image)

    if (canonical) upsertLink('canonical', canonical)

    return () => {
      document.title = DEFAULT_TITLE
    }
  }, [title, description, canonical, image, type])
}