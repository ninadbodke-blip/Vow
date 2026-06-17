-- =====================================================================
-- Add end_state to free_daily_checkins
-- =====================================================================
-- The redesigned daily check-in captures "where are you tonight?" as one
-- of 8 taps (proud / calm / drained / restless / frustrated / heavyhearted
-- / steady / hopeful). It's the anchor the reflection quote is chosen from.
-- Nullable text; older rows simply have null.
-- =====================================================================

alter table public.free_daily_checkins
  add column if not exists end_state text;
