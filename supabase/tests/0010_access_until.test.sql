-- pgTAP: subscription_access_until after 20261029000012. No grace once a charge
-- failed; a 2-hour window for renewals still to be attempted (card on file);
-- the free week without a card ends exactly on time.
begin;
create extension if not exists pgtap with schema extensions;
select plan(5);

create or replace function pg_temp.sub(p_status public.subscription_status, p_trial timestamptz,
                                       p_period timestamptz, p_source bigint)
returns public.subscriptions language sql as $$
  select jsonb_populate_record(null::public.subscriptions, jsonb_build_object(
    'status', p_status, 'trial_ends_at', p_trial, 'current_period_end', p_period,
    'wompi_payment_source_id', p_source))
$$;

select is(public.subscription_access_until(pg_temp.sub('past_due', '2026-10-01', '2026-10-20', 1)),
          '2026-10-20'::timestamptz, 'past_due has no grace: access ends at the period end');
select is(public.subscription_access_until(pg_temp.sub('past_due', '2026-10-01', null, 1)),
          '2026-10-01'::timestamptz, 'past_due after the trial ends at the trial end');
select is(public.subscription_access_until(pg_temp.sub('active', '2026-10-01', '2026-10-20', 1)),
          '2026-10-20'::timestamptz + interval '2 hours', 'active keeps 2 hours while the renewal runs');
select is(public.subscription_access_until(pg_temp.sub('trialing', '2026-10-01', null, null)),
          '2026-10-01'::timestamptz, 'a free week without a card ends exactly on time');
select is(public.subscription_access_until(pg_temp.sub('trialing', '2026-10-01', null, 1)),
          '2026-10-01'::timestamptz + interval '2 hours', 'a trial with a card keeps 2 hours for the first charge');

select * from finish();
rollback;
