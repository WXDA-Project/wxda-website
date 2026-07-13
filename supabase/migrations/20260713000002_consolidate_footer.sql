-- Consolidate the footer into one editable block
delete from page_content where key in ('footer.description', 'footer.copyright');

insert into page_content (key, label, content) values
(
  'footer.body',
  'Footer',
  'Waterloo Cross-Dressing Archive (WXDA) — University of Waterloo. Historical records relating to cross-dressing and gender non-conformity, 1785–1884

© 2026 Fraser Easton'
);
