create policy "admin read blog images" on storage.objects
  for select to authenticated
  using (bucket_id = 'blog-images');
