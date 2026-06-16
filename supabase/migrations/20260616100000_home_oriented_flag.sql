-- =====================================================================
-- Add home_oriented flag to vow_path_progress
-- =====================================================================
-- Tracks whether the user has seen the gentle guided tour ("coach marks")
-- on the home screen. NULL/false => show the tour once on first arrival;
-- set true after they finish or skip it. Replayable any time via the "?"
-- on the home, which does not change this flag.
-- =====================================================================

alter table public.vow_path_progress
  add column if not exists home_oriented boolean not null default false;
