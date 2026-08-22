-- Production vip_subscriptions historically had `active` only.
-- Add expiry columns so Stripe/admin grants can store a window.
-- Existing active rows keep VIP: NULL ends_at means no expiry.

alter table public.vip_subscriptions
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz;
