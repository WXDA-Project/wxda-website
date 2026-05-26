-- ============================================================
-- Field config tables — replace the 4 TypeScript config files
-- Run this in the Supabase dashboard SQL editor
-- ============================================================

-- Document field config
create table document_field_config (
  id               serial  primary key,
  key              text    not null unique,
  label            text    not null,
  role             text,
  filter_type      text    check (filter_type in ('text', 'date-range', 'multiselect')),
  param_key        text,
  show_in_table    boolean not null default false,
  show_in_detail   boolean not null default false,
  is_array         boolean not null default false,
  hide_on_mobile   boolean not null default false,
  hide_on_tablet   boolean not null default false,
  format           text    check (format in ('date')),
  max_table_length integer,
  enriched         boolean not null default false,
  show_in_doc_summary boolean not null default false,
  min_date         text,
  max_date         text,
  sort_order       integer not null default 0
);

alter table document_field_config enable row level security;
create policy "public read" on document_field_config for select using (true);
create policy "admin write" on document_field_config for all    using (auth.role() = 'authenticated');

-- Person field config
create table person_field_config (
  id               serial  primary key,
  key              text    not null unique,
  label            text    not null,
  role             text,
  badge            boolean not null default false,
  filter_type      text    check (filter_type in ('text', 'date-range', 'multiselect')),
  param_key        text,
  show_in_table    boolean not null default false,
  show_in_detail   boolean not null default false,
  is_array         boolean not null default false,
  hide_on_mobile   boolean not null default false,
  hide_on_tablet   boolean not null default false,
  format           text    check (format in ('date')),
  max_table_length integer,
  enriched         boolean not null default false,
  show_in_doc_summary boolean not null default false,
  show_in_enrichment  boolean not null default false,
  min_date         text,
  max_date         text,
  sort_order       integer not null default 0
);

alter table person_field_config enable row level security;
create policy "public read" on person_field_config for select using (true);
create policy "admin write" on person_field_config for all    using (auth.role() = 'authenticated');

-- Container field config
create table container_field_config (
  id         serial  primary key,
  key        text    not null unique,
  role       text,
  sort_order integer not null default 0
);

alter table container_field_config enable row level security;
create policy "public read" on container_field_config for select using (true);
create policy "admin write" on container_field_config for all    using (auth.role() = 'authenticated');

-- Relationship field config
create table relationship_field_config (
  id   serial primary key,
  key  text   not null unique,
  role text
);

alter table relationship_field_config enable row level security;
create policy "public read" on relationship_field_config for select using (true);
create policy "admin write" on relationship_field_config for all    using (auth.role() = 'authenticated');
