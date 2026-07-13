-- Consolidate the About and History pages from multiple section blocks into
-- one full-page markdown block each (headings included), so a single editor
-- textbox controls the whole page.
delete from page_content where key in (
  'about.intro', 'about.acknowledgements', 'about.coverage',
  'history.aims', 'history.next_steps', 'history.methodology'
);

insert into page_content (key, label, content) values
(
  'about.body',
  'About',
  'The WXDA is part of a larger project directed by [Professor Fraser Easton](https://uwaterloo.ca/english/profiles/fraser-easton) that aims to map and make visible a wide range of eighteenth- and nineteenth-century cross-dressing practices, and the complex ways in which those practices were represented across historical periods, report genres, and different sexes and genders, especially in periodical reports.

For enquiries about the WXDA, please email us at [wxda@uwaterloo.ca](mailto:wxda@uwaterloo.ca).

## Acknowledgements

The creation of the WXDA and, separately, the location of cross-dressing records from the Times of London, has been supported by the contributions of several research assistants and others.

Location of cross-dressing records in the Times was made possible in part by research assistance from Y-Dang Troeung, Christine Barbara Frim, Karl Ponthieux Stern, Cheuk Huen Lee (李卓萱), Jo-Ann Bonnett, and Andy Xu. The late Dr. Troeung also helped develop the search set used in the identification of records in the Times digital database. The Waterloo_Cross_Dressing_Archive database content (to which this website gives access), including summaries, analytic categories (fields), and record metatags (values), was created with research assistance from Isabelle Joyce Weigel-Mohamed and Mr. Ponthieux Stern. Professor Ian Johnson provided database layout support, and Professor Simon Burrows provided database advice.

For help with the website, Professor Easton wishes to thank Andy Xu, Camie Kim, and Isabelle Joyce Weigel-Mohamed.

Some of the research for this project was made possible by a SSHRC Insight Grant, a UW/SSHRC Explore Grant, and by the MITACS Globalink Internship program.

## Coverage

Current years on the WXDA: 1785–87, 1801–02, 1833, and 1848. Additional years will be added as time and resources permit.'
),
(
  'history.body',
  'History',
  'The Waterloo Cross-Dressing Archive is part of an ongoing research project on cross-dressing in eighteenth- and nineteenth-century literature and society initiated and directed by Professor Fraser Easton at the University of Waterloo. The WXDA aims to:

1. Expand significantly the range of primary documentation for the study of the material practices of gender variant dress, and make this documentation publicly available, beginning with the Times of London from its inception in 1785 for a full century, that is until 1884. (The expansion of the range of primary documentation follows in part on increases in news production and consumption as the eighteenth century moves into the nineteenth, of which the Times is a leader and bellwether.)
2. Provide a systematic and comprehensive aggregation of cross-dressing records, so that the fullest possible record of trends, variation, distribution, and generic treatments of the social practice may be traced. (While of course also recognizing the limits of any aggregation due to contemporary assumptions and biases, the inaccuracies of journalism, and the arbitrariness of what makes it into the news versus what does not.)
3. Enrich the significance of individual records by tying them, through a series of metatags, to related records across a long-range series, initially of the first century of the Times. Thus the aggregate records will be searchable for general characteristics such as place or time, but also by factors related to the representation of the individuals in the reports, as well as the nature of the reporting itself.
4. Enable the examination of trends in the reporting of cross-dressing activities in terms of frequency, kind, and rendering across key eras of social and cultural development, particularly the period between 1770 and 1850.

As a research tool, of course, the WXDA seeks to serve the interests of its users, and we actively encourage you to send us your thoughts about any aspect of this project, including but not limited to the affordances of the Heurist database, the analytic fields and values used in the records, and the search function of the web portal you are currently viewing (as found through the Search tab above). Further development of the WXDA will be shaped in part by the feedback collected from its users.

In particular, the WXDA seeks to be inclusive and nonjudgemental about the myriad implications of the representation of the material practices of gender variant dress. The WXDA seeks to present period records directly and unedited, and to make them available through the metatags to present-day interests, understandings, and communities. If we can improve our inclusivity or our historical accuracy in any way, please let us know!

## Next steps for the WXDA

1. To refine and confirm the selection of fields and values for the metatags.
2. Continue adding records from additional years of the Times, completing the series from 1785 to 1884.
3. Add records from other sources, initially other periodical records such as The Gentleman’s Magazine and The Daily Advertiser, taking the chronological extent of the archive from the early eighteenth century to the late nineteenth.

## How this database was developed

- The records in the WXDA were located over a period of years using both microfilm copies of the Times and the Times online database.
- For the research conducted on the Times online database, a defined search set was developed with which to locate records. The same search set was used for all searches with the aim of facilitating a consistent and comprehensive capture of cross-dressing records.
- Given the vagaries of vocabulary in newspaper reports of gender-variant dress, problems with typographical elements (broken typeface, poor contrast on the original impression), and the limits of OCR, no keyword-based search set can guarantee a complete recovery of cross-dressing reports in the Times online database.
- Happily, a comparison of the Times online database search set results with the results of searches of the Times in microfilm format shows a roughly 95% capture rate with the use of the search set as compared with the use of microfilm. Comparison of search set results with microfilm results also demonstrates that digital searches located some records (fewer than 5%) missed in the examination of the microfilm format.'
);
