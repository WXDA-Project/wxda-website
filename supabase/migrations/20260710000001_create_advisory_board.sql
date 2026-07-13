-- Advisory board table (bio stored as markdown, e.g. *Book Title* for italics)
create table advisory_board (
  id           integer generated always as identity primary key,
  name         text not null,
  url          text,
  bio          text not null,
  sort_order   integer not null default 0,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

alter table advisory_board enable row level security;

create policy "public read" on advisory_board
  for select to anon
  using (true);

create policy "admin all" on advisory_board
  for all to authenticated
  using (true)
  with check (true);

-- Seed with existing advisory board members
insert into advisory_board (name, url, bio, sort_order) values
  (
    'Katherine Binhammer',
    'https://apps.ualberta.ca/directory/person/kb1',
    'Katherine is a Professor in the Department of English and Film Studies at the University of Alberta and author of Downward Mobility: The Form of Capital in the Sentimental Novel (2020) and The Seduction Narrative in Britain, 1747–1800 (2009). Her essays in queer and gender studies have appeared in Feminist Studies, GLQ, ELH, Literature Compass, and The Journal of the History of Sexuality. Katherine is currently Literary Director of The Orlando Project.',
    0
  ),
  (
    'Simon Burrows',
    'https://researchers.westernsydney.edu.au/en/persons/simon-burrows/',
    'Simon is a Professor of History and Digital Humanities at Western Sydney University. He is known for his innovative studies of the press and French exile writers in Britain and above all as the principal investigator of the award-winning AHRC-funded "French Book Trade in Enlightenment Europe" (FBTEE) database project. Simon is the author or editor of eight books, including a co-edited volume on cross-dressing French diplomat, the chevalière d''Eon, and more than 50 chapters and articles.',
    1
  ),
  (
    'Jeremy Chow',
    'https://www.bucknell.edu/fac-staff/jeremy-chow',
    'Jeremy Chow is an associate professor of English and NEH Chair in the Humanities at Bucknell University (USA). In addition to two score articles and book chapters, Chow is the author of *The Queerness of Water: Troubled Ecologies in the Eighteenth Century* (2023) and the editor of *Eighteenth-Century Environmental Humanities* (2023), *The Edinburgh Companion to Queer Reading* (2025) with Declan Kavanagh, and *Unsettling Sexuality: Queer Horizons in the Eighteenth Century* (2025) with Shelby Johnson.',
    2
  ),
  (
    'Ula Lukszo Klein',
    'https://ulalukszoklein.weebly.com/',
    'Ula is Associate Professor of English and Director of Women''s and Gender Studies at the University of Wisconsin Oshkosh. Her book Sapphic Crossings: Cross-Dressing Women in Eighteenth-Century British Literature (UVa Press, 2021) considers how eighteenth-century writers and reading publics understood sapphic desire as a function of cross-gender embodiments and gender fluid body parts. She is currently working on essays on the Ladies of Llangollen as well as the chevalière d''Eon.',
    3
  ),
  (
    'M. A. Miller',
    'https://english.wsu.edu/faculty-staff/wsu-profile/m.a.miller/',
    'M. A. is an Assistant Professor of Gender, Race, and Health in the program of Women''s, Gender, and Sexuality Studies at Washington State University. They have forthcoming publications in a special issue on "Transing Romanticism" in European Romantic Review, The Edinburgh University Press Companion to Queer Reading, Trans Ecocriticism: Animality, Embodiment, and Environment in Transgender Literature, The Oxford Handbook to Queer Modernisms, The Routledge Handbook of Trans Literature, and The Handbook of Transgender Science Fiction. M.A. is currently working on two academic monographs, "Trans\*-imperial Ecologies: Cultivating the Ideal Trans Subject" and "Gender Unconformities: Deep Time''s Racial Matters" as well as a hybrid-memoir: "Life/Forms/At/Boundaries: A Trans\*-Ecology."',
    4
  ),
  (
    'Ray Siemens',
    'https://www.uvic.ca/humanities/english/people/regularfaculty/siemens-raymond.php',
    'A Distinguished Professor in the Department of English at the University of Victoria, Ray is a pioneer in the field of digital humanities, both in Canada and internationally. His research interests comprehend early Tudor poetry and Renaissance literature, digital humanities, book history, scholarly editing, pedagogy, and scholarly communication. Currently, Ray directs the Electronic Textual Cultures Lab, the Implementing New Knowledge Environments Project, and the Digital Humanities Summer Institute at the University of Victoria.',
    5
  );
