-- News items table (site news feed shown on home page and /about/news)
create table news_items (
  id           integer generated always as identity primary key,
  item_date    date not null,
  text         text not null,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

alter table news_items enable row level security;

create policy "public read" on news_items
  for select to anon
  using (true);

create policy "admin all" on news_items
  for all to authenticated
  using (true)
  with check (true);

-- Seed with existing static news items
insert into news_items (item_date, text) values
  ('2026-06-24', 'Beta version of the new WXDA website launched'),
  ('2025-10-22', 'Work on revised fields and values continues'),
  ('2025-01-14', 'Implementation of revised fields and values is ongoing'),
  ('2024-08-20', 'Edits to improve inclusivity of the WXDA database''s fields and values have been completed'),
  ('2024-07-26', 'Some edits are currently underway to improve the inclusivity of the WXDA database''s fields and values'),
  ('2024-01-17', 'The stable, open access links to the PDFs for Times articles are functioning once again'),
  ('2024-01-14', 'The WXDA Advisory Board has been launched! (see the Advisory Board tab above); the Instructions tab has been updated'),
  ('2024-01-10', 'We''re aware that URL links to the PDFs of Times articles are malfunctioning; an enquiry is in with Cengage to arrange a fix'),
  ('2023-12-31', 'Coming soon: the WXDA Advisory Board'),
  ('2022-10-21', '1833 updated with 16 new records'),
  ('2022-09-14', 'Records for 1802 posted'),
  ('2022-08-10', 'Records for 1801 posted'),
  ('2022-07-25', 'Records for 1848 posted');
