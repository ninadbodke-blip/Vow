-- =====================================================================
-- entitlements — what a user has paid for (source of truth for paywall)
-- =====================================================================
-- One row per (user, product). For now the only product is 'vow_path'
-- (the lifetime, one-time purchase). Razorpay (web) and, later, RevenueCat
-- (Android) both write here, so web + mobile stay in sync on who has paid.
--
-- SECURITY MODEL (critical):
--   * A user may READ their own entitlements (to gate the UI).
--   * No client may INSERT/UPDATE/DELETE — writes happen ONLY from the
--     verify-payment Edge Function using the service-role key, which bypasses
--     RLS. If clients could write this table, anyone could unlock the Path
--     for free. So there are deliberately NO write policies for users.
-- =====================================================================

create table if not exists public.entitlements (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  product         text not null default 'vow_path',
  active          boolean not null default true,
  source          text,                         -- 'razorpay' | 'revenuecat' | 'manual'
  -- payment provenance (for support / reconciliation; nullable for non-payment grants)
  razorpay_payment_id text,
  razorpay_order_id   text,
  amount          integer,                       -- in paise, what was actually charged
  currency        text default 'INR',
  granted_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- one active record per user+product
  unique (user_id, product)
);

create index if not exists entitlements_user_idx on public.entitlements (user_id);

alter table public.entitlements enable row level security;

-- READ: a user can see only their own entitlements.
drop policy if exists "entitlements_select_own" on public.entitlements;
create policy "entitlements_select_own"
  on public.entitlements
  for select
  using (auth.uid() = user_id);

-- NO insert/update/delete policies for clients on purpose.
-- The verify-payment function uses the service-role key (bypasses RLS) to write.

-- keep updated_at fresh
create or replace function public.touch_entitlements_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_entitlements_touch on public.entitlements;
create trigger trg_entitlements_touch
  before update on public.entitlements
  for each row execute function public.touch_entitlements_updated_at();
