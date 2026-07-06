-- Phase 5: facility reservations (pickleball courts, gym, yoga studio)
-- Fixed hourly slot grid, 8am-8pm (12 slots/day), keyed by slot_index.

create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('pickleball', 'gym', 'yoga')),
  slug text not null unique
);

alter table public.facilities enable row level security;

create policy "facilities_select_approved_or_admin"
  on public.facilities for select
  using (public.is_approved_or_admin());

create policy "facilities_admin_write"
  on public.facilities for all
  using (public.is_admin())
  with check (public.is_admin());

create table public.facility_bookings (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities (id) on delete cascade,
  guest_id uuid not null references public.profiles (id) on delete cascade,
  booking_date date not null,
  slot_index int not null check (slot_index >= 0 and slot_index < 12),
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create unique index facility_bookings_no_double_booking
  on public.facility_bookings (facility_id, booking_date, slot_index)
  where (status = 'confirmed');

alter table public.facility_bookings enable row level security;

create policy "facility_bookings_select_own_or_admin"
  on public.facility_bookings for select
  using (guest_id = auth.uid() or public.is_admin());

create policy "facility_bookings_insert_own_approved"
  on public.facility_bookings for insert
  with check (guest_id = auth.uid() and public.is_approved());

create policy "facility_bookings_update_own_or_admin"
  on public.facility_bookings for update
  using (guest_id = auth.uid() or public.is_admin());

create or replace function public.protect_facility_booking_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.facility_id is distinct from old.facility_id
       or new.guest_id is distinct from old.guest_id
       or new.booking_date is distinct from old.booking_date
       or new.slot_index is distinct from old.slot_index
    then
      raise exception 'Guests may only cancel a booking, not modify its details';
    end if;
    if old.status = 'cancelled' then
      raise exception 'This booking is already cancelled';
    end if;
    if new.status is distinct from old.status and new.status != 'cancelled' then
      raise exception 'Guests may only change status to cancelled';
    end if;
  end if;
  return new;
end;
$$;

create trigger facility_bookings_protect_columns
  before update on public.facility_bookings
  for each row execute function public.protect_facility_booking_columns();

insert into public.facilities (name, type, slug) values
  ('Pickleball Court 1', 'pickleball', 'pickleball-court-1'),
  ('Pickleball Court 2', 'pickleball', 'pickleball-court-2'),
  ('Gym', 'gym', 'gym'),
  ('Yoga Studio', 'yoga', 'yoga-studio');
