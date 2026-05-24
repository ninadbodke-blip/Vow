import {
  // navigation
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  ArrowLeft, ArrowRight, ArrowUpRight,
  // actions
  X, Menu, Plus, Check, Search, Settings, MoreHorizontal,
  Share2, Pencil, Trash2,
  // media (founder audio)
  Play, Pause,
  // status
  Lock, Info, Bell,
  // features / nav tabs
  Home, BookOpen, Anchor, Heart, Calendar, User, Quote, Sparkles, Compass,
} from 'lucide-react'

// =====================================================================
// VOW ICON — single source of truth for UI icons.
//
// Why a registry (and not `import * as Lucide`): a dynamic `Lucide[name]`
// lookup can't be tree-shaken, so the whole ~1,500-icon set would ship.
// Registering only what we use keeps the bundle tiny. To add an icon:
//   1. add it to the import above
//   2. add it to ICONS below
// Names are the PascalCase Lucide component names (browse at lucide.dev;
// the site shows kebab-case like "chevron-left" -> use "ChevronLeft").
// =====================================================================

const ICONS = {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  ArrowLeft, ArrowRight, ArrowUpRight,
  X, Menu, Plus, Check, Search, Settings, MoreHorizontal,
  Share2, Pencil, Trash2,
  Play, Pause,
  Lock, Info, Bell,
  Home, BookOpen, Anchor, Heart, Calendar, User, Quote, Sparkles, Compass,
}

const THEMES = {
  dark: '#2A1F15',
  clay: '#854F0B',
  gold: '#D9B57A',
  light: '#FAF7F1',
}

export default function VowIcon({ name, size = 24, theme = 'dark', color, style, ...rest }) {
  const Icon = ICONS[name]

  if (!Icon) {
    if (import.meta.env.DEV) {
      console.warn(`VowIcon: "${name}" is not registered. Add it to ICONS in components/VowIcon.jsx.`)
    }
    return null
  }

  const resolved = color || THEMES[theme] || THEMES.dark

  // strokeWidth is fixed last so nothing downstream can override the
  // 1.5px architectural rule.
  return (
    <Icon
      {...rest}
      size={size}
      color={resolved}
      style={style}
      strokeWidth={1.5}
    />
  )
}