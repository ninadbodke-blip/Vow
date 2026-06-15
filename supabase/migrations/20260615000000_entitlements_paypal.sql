-- =====================================================================
-- Add PayPal provenance columns to entitlements
-- =====================================================================
-- PayPal (international, web) now writes here too, alongside Razorpay (India)
-- and, later, RevenueCat (Android). All three write the SAME 'vow_path'
-- entitlement, so the paywall stays a single source of truth regardless of
-- how the user paid. These columns are nullable (only set for PayPal grants),
-- mirroring the existing razorpay_* columns.
--
-- Writes still happen ONLY from the Edge Functions via the service-role key;
-- no client write policies are added or changed here.
-- =====================================================================

alter table public.entitlements
  add column if not exists paypal_order_id   text,
  add column if not exists paypal_capture_id text;

-- 'source' already documents the provider: 'razorpay' | 'revenuecat' | 'manual' | 'paypal'
