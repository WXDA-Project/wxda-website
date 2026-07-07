-- The 'person-sort' and 'person-name-title' roles were misleadingly named:
-- person-sort (given_names) doubles as the given-name half of the display
-- name, and person-name-title (name_title) is actually the surname. Rename
-- both roles to reflect what they hold; behavior (sort order, display name
-- assembly) is unchanged.
update person_field_config set role = 'person-given-name' where role = 'person-sort';
update person_field_config set role = 'person-surname'    where role = 'person-name-title';
