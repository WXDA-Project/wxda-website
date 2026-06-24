-- Restructure the document filter stack.
--
-- Changes from original seed:
--   • provisional_category        removed from filter stack; label → 'Provisional Category'
--   • name_title                  moved to sort_order 2 (top of detail view)
--   • crossdressing_activities    label casing fixed; sort_order shifted
--   • crossdressing_occupation    label casing fixed
--   • topics                      label → 'Primary source topic'
--   • item_format                 label casing fixed
--   • social_rank                 label casing fixed
--   • discovery_of_crossdressing  added as multiselect filter; label casing fixed
--   • filter stack reordered:
--       crossdressing_activities → crossdressing_occupation → topics →
--       item_format → motive → discovery_of_crossdressing → attire → social_rank

update document_field_config set
  filter_type = null,
  param_key   = null,
  label       = 'Provisional Category'
where key = 'provisional_category';

update document_field_config set label = 'Cross-dressing activity'     where key = 'crossdressing_activities';
update document_field_config set label = 'Cross-dressing occupation'   where key = 'crossdressing_occupation';
update document_field_config set label = 'Primary source topic'        where key = 'topics';
update document_field_config set label = 'Item format'                 where key = 'item_format';
update document_field_config set label = 'Social rank'                 where key = 'social_rank';

update document_field_config set
  filter_type = 'multiselect',
  param_key   = 'discovery',
  label       = 'Discovery of cross-dressing'
where key = 'discovery_of_crossdressing';

-- Re-number all document fields to establish the correct final sort order.
update document_field_config set sort_order =  1 where key = 'date';
update document_field_config set sort_order =  2 where key = 'name_title';
update document_field_config set sort_order =  3 where key = 'short_summary';
update document_field_config set sort_order =  4 where key = 'provisional_category';
update document_field_config set sort_order =  5 where key = 'crossdressing_activities';
update document_field_config set sort_order =  6 where key = 'crossdressing_occupation';
update document_field_config set sort_order =  7 where key = 'locations_mentioned';
update document_field_config set sort_order =  8 where key = 'topics';
update document_field_config set sort_order =  9 where key = 'item_format';
update document_field_config set sort_order = 10 where key = 'motive';
update document_field_config set sort_order = 11 where key = 'discovery_of_crossdressing';
update document_field_config set sort_order = 12 where key = 'attire';
update document_field_config set sort_order = 13 where key = 'social_rank';
update document_field_config set sort_order = 14 where key = 'title';
update document_field_config set sort_order = 15 where key = 'source';
update document_field_config set sort_order = 16 where key = 'container';
update document_field_config set sort_order = 17 where key = 'author_or_creator';
update document_field_config set sort_order = 18 where key = 'gender_manifestation';
update document_field_config set sort_order = 19 where key = 'motive_stated_by_main_protagonist';
update document_field_config set sort_order = 20 where key = 'stated_sex';
update document_field_config set sort_order = 21 where key = 'sex_perceived_by_others';
update document_field_config set sort_order = 22 where key = 'sex_perceived_by_recorder';
update document_field_config set sort_order = 23 where key = 'sexuality';
update document_field_config set sort_order = 24 where key = 'racialization';
update document_field_config set sort_order = 25 where key = 'age_in_record';
update document_field_config set sort_order = 26 where key = 'described_age_in_record';
update document_field_config set sort_order = 27 where key = 'tone_of_the_report';
update document_field_config set sort_order = 28 where key = 'venue';
update document_field_config set sort_order = 29 where key = 'report_scope';
update document_field_config set sort_order = 30 where key = 'report_size';
update document_field_config set sort_order = 31 where key = 'colonial_agency';
update document_field_config set sort_order = 32 where key = 'keyword';
update document_field_config set sort_order = 33 where key = 'secondary_protagonists';
update document_field_config set sort_order = 34 where key = 'alternate_name_s_title_s';
update document_field_config set sort_order = 35 where key = 'related_image';
update document_field_config set sort_order = 36 where key = 'column_s';
update document_field_config set sort_order = 37 where key = 'page_numbers';
update document_field_config set sort_order = 38 where key = 'cite_as';
update document_field_config set sort_order = 39 where key = 'url';
