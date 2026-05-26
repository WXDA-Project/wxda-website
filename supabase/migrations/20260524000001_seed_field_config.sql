-- ============================================================
-- Seed field config tables from current TypeScript config files
-- Run AFTER 20260524000000_create_field_config_tables.sql
-- ============================================================

insert into document_field_config
  (key, label, role, filter_type, param_key, show_in_table, show_in_detail, is_array, hide_on_mobile, hide_on_tablet, format, max_table_length, enriched, show_in_doc_summary, min_date, max_date, sort_order)
values
  ('date',                           'Date',                         'primary-date',   'date-range',  'date',        true,  true,  false, false, false, 'date', null, false, true,  '1785-01-01', '1848-12-31', 1),
  ('short_summary',                  'Summary',                      'doc-summary',    null,          null,          true,  true,  false, false, false, null,   140,  true,  true,  null, null, 2),
  ('provisional_category',           'Category',                     'doc-category',   'multiselect', 'category',    true,  true,  true,  true,  false, null,  null,  false, true,  null, null, 3),
  ('crossdressing_activities',       'Cross-Dressing Activities',    null,             'multiselect', 'activities',  true,  true,  true,  false, true,  null,  null,  false, false, null, null, 4),
  ('locations_mentioned',            'Locations',                    'location',       null,          null,          true,  true,  true,  false, true,  null,  null,  false, false, null, null, 5),
  ('topics',                         'Primary Topics',               null,             'multiselect', 'topics',      false, true,  true,  false, false, null,  null,  false, false, null, null, 6),
  ('motive',                         'Motive',                       null,             'multiselect', 'motive',      false, true,  true,  false, false, null,  null,  false, false, null, null, 7),
  ('attire',                         'Attire',                       null,             'multiselect', 'attire',      false, true,  true,  false, false, null,  null,  false, false, null, null, 8),
  ('item_format',                    'Item Format',                  null,             'multiselect', 'format',      false, true,  true,  false, false, null,  null,  false, false, null, null, 9),
  ('social_rank',                    'Social Rank',                  null,             'multiselect', 'social_rank', false, true,  true,  false, false, null,  null,  false, false, null, null, 10),
  ('crossdressing_occupation',       'Cross-Dressing Occupation',    null,             'multiselect', 'occupation',  false, true,  true,  false, false, null,  null,  false, false, null, null, 11),
  ('title',                          'Title',                        'doc-title',      null,          null,          false, true,  false, false, false, null,  null,  true,  true,  null, null, 12),
  ('name_title',                     'Name / Title',                 'doc-name-title', null,          null,          false, true,  false, false, false, null,  null,  true,  true,  null, null, 13),
  ('source',                         'Source',                       null,             null,          null,          false, true,  false, false, false, null,  null,  false, false, null, null, 14),
  ('container',                      'Publication / Container',      'container-ref',  null,          null,          false, true,  false, false, false, null,  null,  true,  false, null, null, 15),
  ('author_or_creator',              'Author / Creator',             'author-ref',     null,          null,          false, true,  true,  false, false, null,  null,  true,  false, null, null, 16),
  ('discovery_of_crossdressing',     'Discovery of Cross-Dressing',  null,             null,          null,          false, true,  true,  false, false, null,  null,  false, false, null, null, 17),
  ('gender_manifestation',           'Gender Manifestation',         null,             null,          null,          false, true,  true,  false, false, null,  null,  false, false, null, null, 18),
  ('motive_stated_by_main_protagonist', 'Stated Motive (Protagonist)', null,           null,          null,          false, true,  false, false, false, null,  null,  false, false, null, null, 19),
  ('stated_sex',                     'Stated Sex',                   null,             null,          null,          false, true,  false, false, false, null,  null,  false, false, null, null, 20),
  ('sex_perceived_by_others',        'Sex Perceived by Others',      null,             null,          null,          false, true,  true,  false, false, null,  null,  false, false, null, null, 21),
  ('sex_perceived_by_recorder',      'Sex Perceived by Recorder',    null,             null,          null,          false, true,  true,  false, false, null,  null,  false, false, null, null, 22),
  ('sexuality',                      'Sexuality',                    null,             null,          null,          false, true,  true,  false, false, null,  null,  false, false, null, null, 23),
  ('racialization',                  'Racialization',                null,             null,          null,          false, true,  false, false, false, null,  null,  false, false, null, null, 24),
  ('age_in_record',                  'Age in Record',                null,             null,          null,          false, true,  false, false, false, null,  null,  false, false, null, null, 25),
  ('described_age_in_record',        'Described Age in Record',      null,             null,          null,          false, true,  true,  false, false, null,  null,  false, false, null, null, 26),
  ('tone_of_the_report',             'Tone of Report',               null,             null,          null,          false, true,  true,  false, false, null,  null,  false, false, null, null, 27),
  ('venue',                          'Venue',                        null,             null,          null,          false, true,  true,  false, false, null,  null,  false, false, null, null, 28),
  ('report_scope',                   'Report Scope',                 null,             null,          null,          false, true,  false, false, false, null,  null,  false, false, null, null, 29),
  ('report_size',                    'Report Size',                  null,             null,          null,          false, true,  false, false, false, null,  null,  false, false, null, null, 30),
  ('colonial_agency',                'Colonial Agency',              null,             null,          null,          false, true,  true,  false, false, null,  null,  false, false, null, null, 31),
  ('keyword',                        'Keywords',                     null,             null,          null,          false, true,  true,  false, false, null,  null,  false, false, null, null, 32),
  ('secondary_protagonists',         'Secondary Protagonists',       null,             null,          null,          false, true,  true,  false, false, null,  null,  false, false, null, null, 33),
  ('alternate_name_s_title_s',       'Alternate Names / Titles',     null,             null,          null,          false, true,  true,  false, false, null,  null,  false, false, null, null, 34),
  ('related_image',                  'Related Images',               null,             null,          null,          false, true,  true,  false, false, null,  null,  false, false, null, null, 35),
  ('column_s',                       'Column(s)',                    null,             null,          null,          false, true,  true,  false, false, null,  null,  false, false, null, null, 36),
  ('page_numbers',                   'Page Numbers',                 null,             null,          null,          false, true,  true,  false, false, null,  null,  false, false, null, null, 37),
  ('cite_as',                        'Cite as',                      'citation',       null,          null,          false, false, false, false, false, null,  null,  false, false, null, null, 38),
  ('url',                            'Source URL',                   'source-url',     null,          null,          false, false, false, false, false, null,  null,  false, false, null, null, 39);

insert into person_field_config
  (key, label, role, badge, filter_type, param_key, show_in_table, show_in_detail, is_array, max_table_length, show_in_enrichment, sort_order)
values
  ('person_type',             'Person Type',              'person-type',       true,  'multiselect', 'person_type',    true,  true,  true,  null, true,  1),
  ('presumptive_sex',         'Presumptive Sex',          null,                true,  'multiselect', 'presumptive_sex',true,  true,  false, null, true,  2),
  ('social_rank',             'Social Rank',              null,                true,  'multiselect', 'person_rank',    true,  true,  false, null, true,  3),
  ('short_summary',           'Summary',                  'person-summary',    false, null,          null,             true,  false, false, 140,  true,  4),
  ('gender',                  'Gender',                   null,                false, null,          null,             false, true,  false, null, false, 5),
  ('given_names',             'Given Names',              'person-sort',       false, null,          null,             false, true,  false, null, true,  6),
  ('honorific',               'Honorific',                null,                false, null,          null,             false, true,  true,  null, false, 7),
  ('name_title',              'Name / Title(s)',          'person-name-title', false, null,          null,             false, true,  true,  null, true,  8),
  ('title',                   'Title',                    'person-title',      false, null,          null,             false, true,  false, null, true,  9),
  ('alternate_name_s_title_s','Alternate Names / Titles', null,                false, null,          null,             false, true,  true,  null, false, 10),
  ('alternative_name',        'Alternative Name',         null,                false, null,          null,             false, true,  false, null, false, 11),
  ('crossdressing_name_s',    'Cross-Dressing Name(s)',  null,                false, null,          null,             false, true,  true,  null, false, 12),
  ('pseudonym',               'Pseudonym(s)',             null,                false, null,          null,             false, true,  true,  null, false, 13),
  ('notes',                   'Notes',                    null,                false, null,          null,             false, true,  false, null, false, 14);

insert into container_field_config (key, role, sort_order)
values
  ('name_title',    'container-name-title',  1),
  ('short_name',    'container-short-name',  2),
  ('title',         'container-title',       3),
  ('short_summary', 'container-summary',     4),
  ('cite_as',       'container-source-url',  5),
  ('url',           null,                    6);

insert into relationship_field_config (key, role)
values
  ('source_record_pointer', 'relationship-source'),
  ('target_record_pointer', 'relationship-target'),
  ('relationship_type',     'relationship-type');
