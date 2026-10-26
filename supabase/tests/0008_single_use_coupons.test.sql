-- pgTAP: single-use coupons. A coupon with single_use = true can be redeemed once
-- per consumer: issue_coupon_token raises COUPON_ALREADY_USED and
-- verify_coupon_token answers ALREADY_USED after the first redemption; other
-- consumers and regular coupons are unaffected.
begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

create or replace function pg_temp.create_user(p_id uuid, p_email text, p_role text default null)
returns void language sql as $$
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                          raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                          confirmation_token, recovery_token, email_change_token_new, email_change)
  values ('00000000-0000-0000-0000-000000000000', p_id, 'authenticated', 'authenticated', p_email,
          extensions.crypt('password123', extensions.gen_salt('bf')), now(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          jsonb_build_object('full_name', 'Test ' || p_email, 'role', p_role),
          now(), now(), '', '', '', '');
$$;

do $$
begin
  if not exists (select 1 from vault.secrets where name = 'qr_token_secret') then
    perform vault.create_secret('pgtap-only-secret', 'qr_token_secret');
  end if;
end $$;

create temp table su (k text primary key, v text);
grant all on su to public;

select pg_temp.create_user('00000000-0000-4000-8000-000000000081', 'consumer81@test.dev');
select pg_temp.create_user('00000000-0000-4000-8000-000000000082', 'consumer82@test.dev');
select pg_temp.create_user('00000000-0000-4000-8000-000000000084', 'owner84@test.dev', 'business');

insert into public.subscriptions (consumer_id, status, trial_ends_at, wompi_customer_email) values
  ('00000000-0000-4000-8000-000000000081', 'trialing', now() + interval '7 days', 'consumer81@test.dev'),
  ('00000000-0000-4000-8000-000000000082', 'trialing', now() + interval '7 days', 'consumer82@test.dev');

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000084","role":"authenticated"}';
insert into public.businesses (id, owner_id, legal_name, display_name, nit, category)
values ('00000000-0000-4000-8000-0000000008f0', '00000000-0000-4000-8000-000000000084',
        'Bonos SAS', 'Bonos', '900000008-1', 'retail');
insert into su select 'branch', public.add_branch('00000000-0000-4000-8000-0000000008f0', 'Sede Bonos', 'Cra 2 # 2-2', 'Cali', 3.42, -76.52)::text;
insert into public.coupons (id, business_id, title, discount_type, discount_value, is_active, single_use) values
  ('00000000-0000-4000-8000-0000000008f1', '00000000-0000-4000-8000-0000000008f0', 'Bono primera compra', 'fixed', 50000, true, true),
  ('00000000-0000-4000-8000-0000000008f2', '00000000-0000-4000-8000-0000000008f0', 'Martes 2x1',          'bogo',  null,  true, false),
  ('00000000-0000-4000-8000-0000000008f3', '00000000-0000-4000-8000-0000000008f0', 'Postre gratis',       'other', null,  true, false);

reset role;
set local request.jwt.claims to default;
update public.businesses set verification_status = 'verified' where id = '00000000-0000-4000-8000-0000000008f0';

select is((select single_use from public.coupons where id = '00000000-0000-4000-8000-0000000008f2'),
          false, 'coupons are reusable unless marked single-use');

-- consumer 81 redeems the single-use coupon once
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000081","role":"authenticated"}';
insert into su select 'a1', public.issue_coupon_token('00000000-0000-4000-8000-0000000008f1');
insert into su select 'a2', public.issue_coupon_token('00000000-0000-4000-8000-0000000008f1');

set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000084","role":"authenticated"}';
select is((select public.verify_coupon_token(v, null) ->> 'valid' from su where k = 'a1'),
          'true', 'the first redemption of a single-use coupon passes');
select is((select public.verify_coupon_token(v, null) ->> 'reason' from su where k = 'a2'),
          'ALREADY_USED', 'a second token for the same consumer is rejected at the counter');

set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000081","role":"authenticated"}';
select throws_ok($$ select public.issue_coupon_token('00000000-0000-4000-8000-0000000008f1') $$,
                 'P0001', 'COUPON_ALREADY_USED', 'the consumer gets no new QR for a used single-use coupon');

-- regular coupons stay reusable for the same consumer
insert into su select 'b1', public.issue_coupon_token('00000000-0000-4000-8000-0000000008f2');
insert into su select 'b2', public.issue_coupon_token('00000000-0000-4000-8000-0000000008f2');
set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000084","role":"authenticated"}';
select is((select public.verify_coupon_token(v, null) ->> 'valid' from su where k = 'b1'),
          'true', 'a regular coupon is redeemed');
select is((select public.verify_coupon_token(v, null) ->> 'valid' from su where k = 'b2'),
          'true', 'and can be redeemed again by the same consumer');

-- another consumer can still use the single-use coupon once
set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000082","role":"authenticated"}';
insert into su select 'c1', public.issue_coupon_token('00000000-0000-4000-8000-0000000008f1');
set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000084","role":"authenticated"}';
select is((select public.verify_coupon_token(v, null) ->> 'valid' from su where k = 'c1'),
          'true', 'single-use is per consumer: another consumer redeems it');

reset role;
set local request.jwt.claims to default;
select is((select count(*) from public.redemptions
            where coupon_id = '00000000-0000-4000-8000-0000000008f1')::int,
          2, 'exactly one redemption per consumer is recorded for the single-use coupon');

select * from finish();
rollback;
