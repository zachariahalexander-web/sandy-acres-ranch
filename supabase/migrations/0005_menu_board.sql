-- Phase 6: weekend menu collaboration board
-- A guest can see/post on a weekend's board only if they have a confirmed
-- room reservation overlapping that weekend's date range.

create table public.weekends (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  check (end_date > start_date)
);

alter table public.weekends enable row level security;

create or replace function public.has_stay_overlapping(w_start date, w_end date)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.room_reservations rr
    where rr.guest_id = auth.uid()
      and rr.status = 'confirmed'
      and daterange(rr.start_date, rr.end_date, '[)') && daterange(w_start, w_end, '[)')
  );
$$;

create policy "weekends_select_own_stay_or_admin"
  on public.weekends for select
  using (public.is_admin() or public.has_stay_overlapping(start_date, end_date));

create policy "weekends_admin_write"
  on public.weekends for all
  using (public.is_admin())
  with check (public.is_admin());

-- guest_name is captured at post time so the shared board can show who
-- wrote each idea without granting guests read access to each other's
-- full profile rows.
create table public.menu_ideas (
  id uuid primary key default gen_random_uuid(),
  weekend_id uuid not null references public.weekends (id) on delete cascade,
  guest_id uuid not null references public.profiles (id) on delete cascade,
  guest_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.menu_ideas enable row level security;

create policy "menu_ideas_select_own_stay_or_admin"
  on public.menu_ideas for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.weekends w
      where w.id = menu_ideas.weekend_id
        and public.has_stay_overlapping(w.start_date, w.end_date)
    )
  );

create policy "menu_ideas_insert_own_stay_approved"
  on public.menu_ideas for insert
  with check (
    guest_id = auth.uid()
    and public.is_approved()
    and exists (
      select 1 from public.weekends w
      where w.id = menu_ideas.weekend_id
        and public.has_stay_overlapping(w.start_date, w.end_date)
    )
  );

create policy "menu_ideas_delete_own_or_admin"
  on public.menu_ideas for delete
  using (guest_id = auth.uid() or public.is_admin());
