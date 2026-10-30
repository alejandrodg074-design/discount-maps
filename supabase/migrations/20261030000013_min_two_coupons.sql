-- Owner, 2026-10-30: a business needs 2 live coupons (was 3) to appear on the
-- map and must keep 2 while verified. Mirrors MIN_ACTIVE_COUPONS in
-- @org/domain. Idempotent (create or replace); grants are kept.

create or replace view public.businesses_public with (security_invoker = true) as
select b.id, b.display_name, b.category, b.logo_path, b.description,
       s.active_coupon_count, s.best_score
from public.businesses b
join lateral (
  select count(*) as active_coupon_count,
         coalesce(max(public.coupon_score(c.discount_type, c.discount_value)), 0) as best_score
  from public.coupons c
  where c.business_id = b.id and public.coupon_is_live(c)
) s on true
where b.verification_status = 'verified' and s.active_coupon_count >= 2;

create or replace function public.enforce_min_active_coupons() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_verified  boolean;
  v_remaining int;
begin
  if public.is_privileged() then
    return coalesce(new, old);
  end if;
  if tg_op = 'UPDATE' and not (public.coupon_is_live(old) and not public.coupon_is_live(new)) then
    return new;
  end if;
  if tg_op = 'DELETE' and not public.coupon_is_live(old) then
    return old;
  end if;
  select verification_status = 'verified' into v_verified
    from public.businesses where id = old.business_id;
  if not coalesce(v_verified, false) then
    return coalesce(new, old);
  end if;
  select count(*) into v_remaining
    from public.coupons c
   where c.business_id = old.business_id and c.id <> old.id and public.coupon_is_live(c);
  if v_remaining < 2 then
    raise exception 'MIN_ACTIVE_COUPONS' using
      errcode = 'P0001',
      hint = 'Debes mantener al menos 2 cupones activos. Activa otro antes de desactivar este.';
  end if;
  return coalesce(new, old);
end $$;
