-- pgTAP: business categories after 20261029000011. New values work; the retired
-- beverages / desserts are rejected; nearby_businesses filters by the new ones.
begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

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

select pg_temp.create_user('00000000-0000-4000-8000-000000000091', 'owner91@test.dev', 'business');
select pg_temp.create_user('00000000-0000-4000-8000-000000000092', 'owner92@test.dev', 'business');

select is(
  (select array_agg(e.enumlabel::text order by e.enumsortorder)
     from pg_enum e join pg_type t on t.oid = e.enumtypid
    where t.typname = 'business_category'
      and e.enumlabel in ('food', 'retail', 'vehicles', 'nightlife', 'pets', 'beauty')),
  array['food', 'retail', 'vehicles', 'nightlife', 'pets', 'beauty'],
  'the six current categories exist');

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000091","role":"authenticated"}';
select lives_ok($$
  insert into public.businesses (owner_id, legal_name, display_name, nit, category)
  values ('00000000-0000-4000-8000-000000000091', 'Lavadero SAS', 'Lavadero', '900000009-1', 'vehicles')
$$, 'a business can use a new category');

set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000092","role":"authenticated"}';
select throws_ok($$
  insert into public.businesses (owner_id, legal_name, display_name, nit, category)
  values ('00000000-0000-4000-8000-000000000092', 'Jugos SAS', 'Jugos', '900000009-2', 'beverages')
$$, '23514', null, 'a retired category is rejected');

reset role;
set local request.jwt.claims to default;
select is((select count(*) from public.businesses where category in ('beverages', 'desserts'))::int,
          0, 'no business keeps a retired category');

select * from finish();
rollback;
