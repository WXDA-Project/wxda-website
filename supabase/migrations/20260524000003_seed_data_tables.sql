-- Seed data for local development and testing.
-- A small representative slice of each table — enough for the app and E2E tests to function.

-- ── containers ─────────────────────────────────────────────────────────────

insert into containers (id, visibility, title, name_title, short_name, short_summary)
overriding system value values
  (423, 'viewable', 'Times : Times of London',     'Times of London',     'Times', null),
  (845, 'viewable', 'DA : The Daily Advertiser',   'The Daily Advertiser','DA',    'A daily London newspaper published 1731 to 1796.');

select setval(pg_get_serial_sequence('containers', 'id'), (select max(id) from containers));

-- ── persons ────────────────────────────────────────────────────────────────

insert into persons (id, visibility, title, name_title, given_names, person_type, social_rank, short_summary)
overriding system value values
  (380, 'public', 'D''Eon',          array['D''Eon'],             null,   array['Subject of study'], 'Aristocrat', null),
  (389, 'public', 'Piles,Pile, Mary',array['Piles','Pile'],       'Mary', array['Subject of study'], null,         null),
  (442, 'public', '"Inquisitor"',    array['"Inquisitor"'],        null,   array['Author'],           null,         null),
  (444, 'public', 'Davis,Davies',    array['Davis','Davies'],      null,   array['Subject of study'], null,         null),
  (448, 'public', 'Martyr',          array['Martyr'],              null,   array['Subject of study'], null,         null);

select setval(pg_get_serial_sequence('persons', 'id'), (select max(id) from persons));

-- ── documents ──────────────────────────────────────────────────────────────

insert into documents (id, visibility, title, name_title, short_summary, date, author_or_creator, container, locations_mentioned, provisional_category)
overriding system value values
  (374, 'public',
    '28 Feb 1785. On Masks and Masquerades.',
    'On Masks and Masquerades.',
    'Masquerade Editorial: OT proscription of men crossdressing, a man in "the habit of a woman ... is the most ordinary disguise of our present masquerades."',
    '1785-02-28', array['442'], '423', null, null),
  (378, 'public',
    '8 Apr 1785. No title. News that Mad. D''Eon obtained permission to make the journey to England.',
    'No title.',
    'News that Mad. D''Eon obtained permission to make the journey to England in "man''s clothes".',
    '1785-04-08', null, '423', array['England'], array['Woman Warrior']),
  (383, 'public',
    '9 Apr 1785. Extract of a Letter from Paris, March 18. Prince Henry of Prussia visits Chevalier D''Eon.',
    'Extract of a Letter from Paris, March 18.',
    'Prince Henry of Prussia visits Chevalier D''Eon.',
    '1785-04-09', null, '423', array['Paris'], array['Woman Warrior']),
  (387, 'public',
    '9 Apr 1785. No title. Mary Piles committed to Newgate for burglary in man''s apparel.',
    'No title.',
    'Mary Piles "committed to Newgate" for burglary "in man''s apparel, which she has worn several years".',
    '1785-04-09', null, '423', array['London'], array['Criminal']),
  (393, 'public',
    '11 Apr 1785. No title. Mary Pile tried in mens clothes for stealing.',
    'No title.',
    'Mary Pile "tried in mens clothes, which she constantly wears" for stealing from Abraham Abbott.',
    '1785-04-11', null, '423', array['London'], array['Criminal']);

select setval(pg_get_serial_sequence('documents', 'id'), (select max(id) from documents));

-- ── relationships ──────────────────────────────────────────────────────────
-- Links person 442 ("Inquisitor") as author of document 374.

insert into relationships (id, visibility, title, relationship_type, source_record_pointer, target_record_pointer)
overriding system value values
  (1, 'public', 'is Author Of', 'is Author Of', '442', '374');

select setval(pg_get_serial_sequence('relationships', 'id'), (select max(id) from relationships));

-- ── geocode_cache ──────────────────────────────────────────────────────────
-- Includes entries for all locations referenced in the seeded documents.

insert into geocode_cache (location, lat, lng) values
  ('London',     51.5073509,  -0.1277583),
  ('England',    52.3555177,  -1.1743197),
  ('Paris',      48.8588897,   2.3200410),
  ('America',    39.7837304, -100.4458825),
  ('Berlin',     52.5170365,  13.3888599),
  ('Birmingham', 52.4796992,  -1.9026911),
  ('Blackheath', 51.4703420,   0.0058096),
  ('Calcutta',   22.5726459,  88.3638953);
