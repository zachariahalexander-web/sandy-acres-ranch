-- Phase 7: private interior gallery, gated to approved guests/admin.
-- Upload photos via the Supabase dashboard's Storage UI into the
-- "gallery-private" bucket -- no admin upload UI is built for this yet.

insert into storage.buckets (id, name, public)
values ('gallery-private', 'gallery-private', false)
on conflict (id) do nothing;

create policy "gallery_private_select_approved_or_admin"
  on storage.objects for select
  using (bucket_id = 'gallery-private' and public.is_approved_or_admin());

create policy "gallery_private_admin_write"
  on storage.objects for all
  using (bucket_id = 'gallery-private' and public.is_admin())
  with check (bucket_id = 'gallery-private' and public.is_admin());
