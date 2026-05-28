import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

// =====================================================================
// ANCHOR REACTION BADGE  (mounts inside the Anchors tool icon)
// =====================================================================
// A tiny clay-orange count pill that overlays the Anchors glyph in the
// tools row. Counts reactions the user hasn't acknowledged yet.
//
// "Seen" is tracked via localStorage key `vow_anchor_reactions_last_seen`
// — bumped whenever the user opens /anchors (the destination screen
// writes the timestamp itself, so any path into Anchors clears the
// badge). If no lastSeen exists, the badge defaults to a 7-day window
// so first-time users still see fresh activity.
//
// Subscribes to anchor_reactions inserts via Supabase realtime so the
// count rises live while the user is on a home. Also listens for the
// cross-tab `storage` event so opening /anchors in another tab clears
// the badge here too. Returns null when there's nothing unseen.
// =====================================================================

const LAST_SEEN_KEY = 'vow_anchor_reactions_last_seen'
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export default function AnchorReactionBadge() {
  const [unseen, setUnseen] = useState(0)

  useEffect(() => {
    let mounted = true
    let channel = null

    const loadCount = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !mounted) return
      const lastSeen = localStorage.getItem(LAST_SEEN_KEY)
      const since = lastSeen || new Date(Date.now() - SEVEN_DAYS_MS).toISOString()
      const { count, error } = await supabase
        .from('anchor_reactions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gt('created_at', since)
      if (!mounted) return
      if (!error) setUnseen(count || 0)
    }

    const init = async () => {
      await loadCount()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !mounted) return
      channel = supabase
        .channel(`anchor_reaction_badge_${user.id}`)
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'anchor_reactions', filter: `user_id=eq.${user.id}` },
          () => { if (mounted) loadCount() }
        )
        .subscribe()
    }
    init()

    const onStorage = (e) => {
      if (e.key === LAST_SEEN_KEY && mounted) loadCount()
    }
    window.addEventListener('storage', onStorage)

    return () => {
      mounted = false
      window.removeEventListener('storage', onStorage)
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  if (unseen === 0) return null

  return (
    <span style={styles.badge} aria-label={`${unseen} new anchor reactions`}>
      {unseen > 9 ? '9+' : unseen}
    </span>
  )
}

const styles = {
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-8px',
    minWidth: '18px',
    height: '18px',
    padding: '0 5px',
    background: '#C5572C',
    color: '#FAF7F1',
    fontSize: '10px',
    fontWeight: 700,
    lineHeight: '15px',
    textAlign: 'center',
    borderRadius: '999px',
    border: '1.5px solid #FAF7F1',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    letterSpacing: 0,
    pointerEvents: 'none',
  },
}