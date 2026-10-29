-- Business categories (owner, 2026-10-29): "Comida y bebidas" replaces
-- restaurants / beverages / desserts; new: beauty (belleza), vehicles,
-- nightlife (bares y discotecas), pets. Tiendas (retail) stays.
--
-- Postgres cannot drop enum values without rebuilding every dependent object
-- (the businesses_public view, nearby_businesses), so `restaurants` is renamed
-- to `food`, the other two retired values are kept but blocked by a check, and
-- existing businesses move to `food`.
-- Idempotent on purpose: the owner applies it from the SQL editor before the
-- app deploy, so a later `supabase db push` may run it a second time.

do $$
begin
  if exists (
    select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
     where t.typname = 'business_category' and e.enumlabel = 'restaurants'
  ) then
    alter type public.business_category rename value 'restaurants' to 'food';
  end if;
end $$;

alter type public.business_category add value if not exists 'vehicles';
alter type public.business_category add value if not exists 'nightlife';
alter type public.business_category add value if not exists 'pets';
alter type public.business_category add value if not exists 'beauty';

update public.businesses set category = 'food' where category in ('beverages', 'desserts');

alter table public.businesses drop constraint if exists businesses_category_current;
alter table public.businesses add constraint businesses_category_current
  check (category not in ('beverages', 'desserts'));

comment on type public.business_category is
  'food, retail, beauty, vehicles, nightlife, pets. beverages / desserts are retired (merged into food) and rejected by businesses_category_current.';
