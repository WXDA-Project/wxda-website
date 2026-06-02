alter table document_field_config
  drop column if exists min_date,
  drop column if exists max_date;

alter table person_field_config
  drop column if exists min_date,
  drop column if exists max_date;
