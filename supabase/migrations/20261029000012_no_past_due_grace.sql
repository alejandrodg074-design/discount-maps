-- Owner, 2026-10-29: a consumer whose charge fails loses access at once (no
-- 5-day past_due grace); the automatic retries or a new card restore it.
-- Renewals that are due but not attempted yet keep 2 hours of access with a
-- card on file, so the hourly billing run does not lock out paying customers.
-- A free week without a card ends exactly at trial_ends_at.
-- Mirrors subscriptionAccessUntil / RENEWAL_WINDOW_HOURS in @org/domain.
-- Idempotent (create or replace); grants on the function are kept.

create or replace function public.subscription_access_until(s public.subscriptions) returns timestamptz
language sql immutable set search_path = '' as $$
  select case s.status
    when 'trialing' then s.trial_ends_at
      + case when s.wompi_payment_source_id is not null then interval '2 hours' else interval '0' end
    when 'active'   then s.current_period_end + interval '2 hours'
    when 'past_due' then coalesce(s.current_period_end, s.trial_ends_at)
    when 'canceled' then coalesce(s.current_period_end, s.trial_ends_at)
  end
$$;
