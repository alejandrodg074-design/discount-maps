-- Single-use coupons: a merchant can mark a coupon as usable once per consumer
-- (e.g. "Bono de $50.000 en tu primera compra"). Only adds a column, an index
-- and replaces the two QR functions; existing coupons keep single_use = false.
-- Idempotent on purpose: the owner applies it from the SQL editor before the app
-- deploy, so a later `supabase db push` may run it a second time.

alter table public.coupons
  add column if not exists single_use boolean not null default false;

comment on column public.coupons.single_use is
  'When true each consumer can redeem this coupon only once (checked by issue_coupon_token and verify_coupon_token).';

-- "Has this consumer already redeemed this coupon?" is asked on every issue/verify.
create index if not exists redemptions_consumer_coupon_idx on public.redemptions (consumer_id, coupon_id);

-- Issuing: same rules as before, plus COUPON_ALREADY_USED for a single-use coupon
-- the consumer already redeemed (so the app explains it instead of showing a QR
-- that the merchant would reject).
create or replace function public.issue_coupon_token(p_coupon_id uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_secret  text;
  v_sub     public.subscriptions;
  v_c       public.coupons;
  v_exp     bigint;
  v_jti     text;
  v_payload text;
begin
  if auth.uid() is null then
    raise exception 'UNAUTHENTICATED';
  end if;
  select * into v_sub from public.subscriptions where consumer_id = auth.uid();
  if v_sub.id is null or public.subscription_access_until(v_sub) <= now() then
    raise exception 'SUBSCRIPTION_INACTIVE';
  end if;
  select c.* into v_c
    from public.coupons c
    join public.businesses b on b.id = c.business_id
   where c.id = p_coupon_id and public.coupon_is_live(c) and b.verification_status = 'verified';
  if v_c.id is null then
    raise exception 'COUPON_UNAVAILABLE';
  end if;
  if v_c.single_use and exists (
    select 1 from public.redemptions r
     where r.consumer_id = auth.uid() and r.coupon_id = p_coupon_id
  ) then
    raise exception 'COUPON_ALREADY_USED';
  end if;
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'qr_token_secret';
  if v_secret is null then
    raise exception 'QR_SECRET_MISSING';
  end if;
  v_exp := extract(epoch from now() + interval '90 seconds')::bigint;
  v_jti := encode(extensions.gen_random_bytes(8), 'hex');
  v_payload := auth.uid()::text || '.' || p_coupon_id::text || '.' || v_exp || '.' || v_jti;
  return 'dm1.' || v_payload || '.' || encode(extensions.hmac(v_payload, v_secret, 'sha256'), 'hex');
end $$;

-- Verifying: same rules as before, plus ALREADY_USED for a single-use coupon this
-- consumer already redeemed. The advisory lock serialises two scans of the same
-- consumer + coupon so both cannot pass the check at once.
create or replace function public.verify_coupon_token(p_token text, p_branch_id uuid default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  p          text[];
  v_secret   text;
  v_expected text;
  v_consumer uuid;
  v_coupon   uuid;
  v_exp      bigint;
  v_c        public.coupons;
  v_b        public.businesses;
  v_sub      public.subscriptions;
  v_name     text;
begin
  if auth.uid() is null then
    return jsonb_build_object('valid', false, 'reason', 'UNAUTHENTICATED');
  end if;
  p := string_to_array(p_token, '.');
  if coalesce(array_length(p, 1), 0) <> 6 or p[1] <> 'dm1' then
    return jsonb_build_object('valid', false, 'reason', 'MALFORMED');
  end if;
  begin
    v_consumer := p[2]::uuid;
    v_coupon   := p[3]::uuid;
    v_exp      := p[4]::bigint;
  exception when others then
    return jsonb_build_object('valid', false, 'reason', 'MALFORMED');
  end;
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'qr_token_secret';
  v_expected := encode(extensions.hmac(p[2] || '.' || p[3] || '.' || p[4] || '.' || p[5], v_secret, 'sha256'), 'hex');
  if v_expected <> p[6] then
    return jsonb_build_object('valid', false, 'reason', 'BAD_SIGNATURE');
  end if;
  if v_exp < extract(epoch from now()) then
    return jsonb_build_object('valid', false, 'reason', 'EXPIRED');
  end if;
  select * into v_c from public.coupons where id = v_coupon;
  select * into v_b from public.businesses where id = v_c.business_id;
  if v_b.owner_id is distinct from auth.uid() then
    return jsonb_build_object('valid', false, 'reason', 'WRONG_BUSINESS');
  end if;
  if not public.coupon_is_live(v_c) then
    return jsonb_build_object('valid', false, 'reason', 'COUPON_INACTIVE');
  end if;
  select * into v_sub from public.subscriptions where consumer_id = v_consumer;
  if v_sub.id is null or public.subscription_access_until(v_sub) <= now() then
    return jsonb_build_object('valid', false, 'reason', 'SUBSCRIPTION_INACTIVE');
  end if;
  if v_c.single_use then
    perform pg_advisory_xact_lock(hashtextextended(v_consumer::text || ':' || v_coupon::text, 0));
    if exists (
      select 1 from public.redemptions r
       where r.consumer_id = v_consumer and r.coupon_id = v_coupon
    ) then
      return jsonb_build_object('valid', false, 'reason', 'ALREADY_USED');
    end if;
  end if;
  insert into public.redemptions
    (coupon_id, consumer_id, branch_id, business_id, scanned_by, subscription_status_at_scan, token_jti)
  values
    (v_coupon, v_consumer, p_branch_id, v_b.id, auth.uid(), v_sub.status, p[5])
  on conflict (token_jti) do nothing;
  if not found then
    return jsonb_build_object('valid', false, 'reason', 'ALREADY_REDEEMED');
  end if;
  select full_name into v_name from public.profiles where id = v_consumer;
  return jsonb_build_object('valid', true, 'consumer_name', v_name, 'coupon_title', v_c.title);
end $$;

-- create or replace keeps existing grants; restated so this file stands alone.
revoke execute on function public.issue_coupon_token(uuid)        from public, anon;
revoke execute on function public.verify_coupon_token(text, uuid) from public, anon;
grant  execute on function public.issue_coupon_token(uuid)        to authenticated, service_role;
grant  execute on function public.verify_coupon_token(text, uuid) to authenticated, service_role;
