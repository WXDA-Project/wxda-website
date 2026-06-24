-- Blog posts table
create table blog_posts (
  id              integer generated always as identity primary key,
  slug            text unique not null,
  title           text not null,
  summary         text,
  content         text,
  cover_image_url text,
  published_at    timestamptz,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

alter table blog_posts enable row level security;

create policy "public read" on blog_posts
  for select to anon
  using (published_at is not null);

create policy "admin all" on blog_posts
  for all to authenticated
  using (true)
  with check (true);

-- Storage bucket for blog images
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

create policy "public read blog images" on storage.objects
  for select to anon
  using (bucket_id = 'blog-images');

create policy "admin upload blog images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'blog-images');

create policy "admin update blog images" on storage.objects
  for update to authenticated
  using (bucket_id = 'blog-images');

create policy "admin delete blog images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'blog-images');
