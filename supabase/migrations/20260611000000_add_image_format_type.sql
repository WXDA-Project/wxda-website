alter table document_field_config
  drop constraint if exists document_field_config_format_check;
alter table document_field_config
  add constraint document_field_config_format_check check (format in ('date', 'image'));

update document_field_config set format = 'image' where key = 'related_image';
