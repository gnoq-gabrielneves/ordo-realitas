insert into storage.buckets (id, name, public)
values ('circulos', 'circulos', true)
on conflict (id) do nothing;

drop policy if exists "circulos_public_read" on storage.objects;
create policy "circulos_public_read" on storage.objects for select
  using (bucket_id = 'circulos');

drop policy if exists "circulos_owner_insert" on storage.objects;
create policy "circulos_owner_insert" on storage.objects for insert
  with check (
    bucket_id = 'circulos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "circulos_owner_update" on storage.objects;
create policy "circulos_owner_update" on storage.objects for update
  using (
    bucket_id = 'circulos'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'circulos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "circulos_owner_delete" on storage.objects;
create policy "circulos_owner_delete" on storage.objects for delete
  using (
    bucket_id = 'circulos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
