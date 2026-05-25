-- Core data tables for the WXDA archive.
-- These were created directly in production; this migration adds them to the local stack.

-- ── containers ─────────────────────────────────────────────────────────────

create table containers (
  id            integer generated always as identity primary key,
  visibility    text,
  title         text,
  title_raw     text,
  cite_as       text,
  url           text,
  added         timestamptz,
  modified      timestamptz,
  name_title    text,
  short_name    text,
  short_summary text,
  fts           tsvector generated always as (
    to_tsvector('english'::regconfig,
      (coalesce(title, '') || ' ') || coalesce(short_summary, ''))
  ) stored
);

alter table containers enable row level security;
create policy "public read" on containers for select to anon using (true);

-- ── persons ────────────────────────────────────────────────────────────────

create table persons (
  id                       integer generated always as identity primary key,
  visibility               text,
  title                    text,
  title_raw                text,
  cite_as                  text,
  url                      text,
  added                    timestamptz,
  modified                 timestamptz,
  alternate_name_s_title_s text[],
  alternative_name         text,
  crossdressing_name_s     text[],
  gender                   text,
  given_names              text,
  honorific                text[],
  name_title               text[],
  notes                    text,
  person_type              text[],
  presumptive_sex          text,
  primary_preferred_image  text,
  pseudonym                text[],
  short_summary            text,
  social_rank              text,
  fts                      tsvector generated always as (
    to_tsvector('english'::regconfig,
      ((coalesce(title, '') || ' ') || coalesce(short_summary, '')) || coalesce(notes, ''))
  ) stored
);

alter table persons enable row level security;
create policy "public read" on persons for select to anon
  using (visibility = any (array['public'::text, 'viewable'::text]));

-- ── documents ──────────────────────────────────────────────────────────────

create table documents (
  id                                integer generated always as identity primary key,
  visibility                        text,
  title                             text,
  title_raw                         text,
  cite_as                           text,
  url                               text,
  added                             timestamptz,
  modified                          timestamptz,
  age_in_record                     text,
  alternate_name_s_title_s          text[],
  attire                            text[],
  author_or_creator                 text[],
  colonial_agency                   text[],
  column_s                          text[],
  container                         text,
  container_form                    text,
  crossdressing_activities          text[],
  crossdressing_occupation          text[],
  date                              date,
  described_age_in_record           text[],
  discovery_of_crossdressing        text[],
  gender_manifestation              text[],
  item_format                       text[],
  keyword                           text[],
  locations_mentioned               text[],
  motive                            text[],
  motive_stated_by_main_protagonist text,
  name_title                        text,
  page_numbers                      text[],
  provisional_category              text[],
  racialization                     text,
  related_image                     text[],
  report_scope                      text,
  report_size                       text,
  secondary_protagonists            text[],
  sex_perceived_by_others           text[],
  sex_perceived_by_recorder         text[],
  sexuality                         text[],
  short_summary                     text,
  social_rank                       text[],
  source                            text,
  stated_sex                        text,
  tone_of_the_report                text[],
  topics                            text[],
  venue                             text[],
  fts                               tsvector generated always as (
    to_tsvector('english'::regconfig,
      (coalesce(title, '') || ' ') || coalesce(short_summary, ''))
  ) stored
);

alter table documents enable row level security;
create policy "public read" on documents for select to anon
  using (visibility = 'public'::text);

-- ── relationships ──────────────────────────────────────────────────────────

create table relationships (
  id                    integer generated always as identity primary key,
  visibility            text,
  title                 text,
  title_raw             text,
  cite_as               text,
  url                   text,
  added                 timestamptz,
  modified              timestamptz,
  relationship_type     text,
  source_record_pointer text,
  target_record_pointer text,
  fts                   tsvector generated always as (
    to_tsvector('english'::regconfig, coalesce(title, ''))
  ) stored
);

alter table relationships enable row level security;
create policy "public read" on relationships for select to anon
  using (visibility = any (array['public'::text, 'viewable'::text]));

-- ── geocode_cache ──────────────────────────────────────────────────────────

create table geocode_cache (
  location    text primary key,
  lat         double precision,
  lng         double precision,
  geocoded_at timestamptz default now()
);

alter table geocode_cache enable row level security;
create policy "public read" on geocode_cache for select to anon using (true);
