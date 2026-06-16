-- =====================================================================
-- Add oracle_oriented + motivation_oriented flags to vow_path_progress
-- =====================================================================
-- Mirror of home_oriented: each tracks whether the user has seen the
-- gentle guided tour ("coach marks") for that tab. NULL/false => show
-- the tour once on first arrival to that tab; set true after they finish
-- or skip. Replayable any time via the "?" on each tab (does not change
-- these flags).
-- =====================================================================

alter table public.vow_path_progress
  add column if not exists oracle_oriented boolean not null default false;

alter table public.vow_path_progress
  add column if not exists motivation_oriented boolean not null default false;
