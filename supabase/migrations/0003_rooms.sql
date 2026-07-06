-- Phase 4: room reservations for the Main House and Guest House

create extension if not exists btree_gist;

create or replace function public.is_approved_or_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.is_approved() or public.is_admin();
$$;

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text
);

create table public.bedrooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  name text not null,
  max_occupancy int,
  unique (property_id, name)
);

alter table public.properties enable row level security;
alter table public.bedrooms enable row level security;

create policy "properties_select_approved_or_admin"
  on public.properties for select
  using (public.is_approved_or_admin());

create policy "bedrooms_select_approved_or_admin"
  on public.bedrooms for select
  using (public.is_approved_or_admin());

create policy "properties_admin_write"
  on public.properties for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "bedrooms_admin_write"
  on public.bedrooms for all
  using (public.is_admin())
  with check (public.is_admin());

create table public.room_reservations (
  id uuid primary key default gen_random_uuid(),
  bedroom_id uuid not null references public.bedrooms (id) on delete cascade,
  guest_id uuid not null references public.profiles (id) on delete cascade,
  start_date date not null,
  end_date date not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  stay_range daterange generated always as (daterange(start_date, end_date, '[)')) stored,
  created_at timestamptz not null default now(),
  check (end_date > start_date),
  exclude using gist (bedroom_id with =, stay_range with &&) where (status = 'confirmed')
);

alter table public.room_reservations enable row level security;

create policy "room_reservations_select_own_or_admin"
  on public.room_reservations for select
  using (guest_id = auth.uid() or public.is_admin());

create policy "room_reservations_insert_own_approved"
  on public.room_reservations for insert
  with check (guest_id = auth.uid() and public.is_approved());

create policy "room_reservations_update_own_or_admin"
  on public.room_reservations for update
  using (guest_id = auth.uid() or public.is_admin());

create or replace function public.protect_room_reservation_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.bedroom_id is distinct from old.bedroom_id
       or new.guest_id is distinct from old.guest_id
       or new.start_date is distinct from old.start_date
       or new.end_date is distinct from old.end_date
    then
      raise exception 'Guests may only cancel a reservation, not modify its details';
    end if;
    if old.status = 'cancelled' then
      raise exception 'This reservation is already cancelled';
    end if;
    if new.status is distinct from old.status and new.status != 'cancelled' then
      raise exception 'Guests may only change status to cancelled';
    end if;
  end if;
  return new;
end;
$$;

create trigger room_reservations_protect_columns
  before update on public.room_reservations
  for each row execute function public.protect_room_reservation_columns();

insert into public.properties (name, slug, description) values
  ('Main House', 'main-house', 'Four bedrooms close to the firepit and the pond.'),
  ('Guest House', 'guest-house', 'A second four-bedroom house nearby.');

insert into public.bedrooms (property_id, name, max_occupancy)
select properties.id, r.name, r.occ from public.properties, lateral (
  values
    ('Room 1', 2),
    ('Room 2', 2),
    ('Room 3', 2),
    ('Room 4', 4)
) as r(name, occ);
