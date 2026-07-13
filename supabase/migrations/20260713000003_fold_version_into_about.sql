-- Fold the "Version" line into the single About content block instead of a
-- separate key, so the whole About page is one editable block.
update page_content
set content = content || E'\n\n---\n\n**Version:** 24 June 2026'
where key = 'about.body';
