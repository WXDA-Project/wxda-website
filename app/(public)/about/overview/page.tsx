import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Overview — Waterloo Cross-Dressing Archive',
  description:
    'An overview of the Waterloo Cross-Dressing Archive project, its aims, scope, and development methodology.',
}

export default function OverviewPage() {
  return (
    <div className="bg-parchment min-h-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        <header className="mb-10">
          <p className="text-xs tracking-widest uppercase text-muted font-sans mb-3">
            Waterloo Cross-Dressing Archive &middot; University of Waterloo
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink leading-tight">
            Overview
          </h1>
          <div className="mt-5 border-t-2 border-ink" />
        </header>

        <article className="text-ink">

          <section className="pb-10 border-b border-border">
            <p className="font-serif text-base sm:text-lg leading-relaxed text-muted">
              The Waterloo Cross-Dressing Archive is part of an ongoing research
              project on cross-dressing in eighteenth- and nineteenth-century
              literature and society initiated and directed by Professor Fraser
              Easton at the University of Waterloo. The WXDA currently contains
              records from the Times for the years 1785&#x2013;87, 1801&#x2013;02,
              1833, and 1848. The WXDA aims to:
            </p>

            <ol className="mt-6 space-y-4 list-decimal list-outside pl-6 font-serif text-base leading-relaxed text-muted">
              <li>
                Expand significantly the range of primary documentation for the
                study of the material practices of gender variant dress, and make
                this documentation publicly available, beginning with the Times of
                London from its inception in 1785 for a full century, that is until
                1884. (The expansion of the range of primary documentation follows
                in part on increases in news production and consumption as the
                eighteenth century moves into the nineteenth, of which the Times is
                a leader and bellwether.)
              </li>
              <li>
                Provide a systematic and comprehensive aggregation of cross-dressing
                records, so that the fullest possible record of trends, variation,
                distribution, and generic treatments of the social practice may be
                traced. (While of course also recognizing the limits of any
                aggregation due to contemporary assumptions and biases, the
                inaccuracies of journalism, and the arbitrariness of what makes it
                into the news versus what does not.)
              </li>
              <li>
                Enrich the significance of individual records by tying them, through
                a series of metatags, to related records across a long-range series,
                initially of the first century of the Times. Thus the aggregate
                records will be searchable for general characteristics such as place
                or time, but also by factors related to the representation of the
                individuals in the reports, as well as the nature of the reporting
                itself.
              </li>
              <li>
                Enable the examination of trends in the reporting of cross-dressing
                activities in terms of frequency, kind, and rendering across key
                eras of social and cultural development, particularly the period
                between 1770 and 1850.
              </li>
            </ol>

            <p className="mt-6 font-serif text-base sm:text-lg leading-relaxed text-muted">
              As a research tool, of course, the WXDA seeks to serve the interests
              of its users, and we actively encourage you to send us your thoughts
              about any aspect of this project, including but not limited to the
              affordances of the Heurist database, the analytic fields and values
              used in the records, and the search function of the web portal you
              are currently viewing (as found through the Search tab above).
              Further development of the WXDA will be shaped in part by the
              feedback collected from its users.
            </p>

            <p className="mt-5 font-serif text-base sm:text-lg leading-relaxed text-muted">
              In particular, the WXDA seeks to be inclusive and nonjudgemental
              about the myriad implications of the representation of the material
              practices of gender variant dress. The WXDA seeks to present period
              records directly and unedited, and to make them available through the
              metatags to present-day interests, understandings, and communities.
              If we can improve our inclusivity or our historical accuracy in any
              way, please let us know!
            </p>
          </section>

          <section className="py-10 border-b border-border">
            <h2 className="font-serif text-2xl font-bold text-ink mb-5">
              Next steps for the WXDA
            </h2>
            <ol className="space-y-3 list-decimal list-outside pl-6 font-serif text-base leading-relaxed text-muted">
              <li>
                To refine and confirm the selection of fields and values for the
                metatags.
              </li>
              <li>
                Continue adding records from additional years of the Times,
                completing the series from 1785 to 1884.
              </li>
              <li>
                Add records from other sources, initially other periodical records
                such as The Gentleman&rsquo;s Magazine and The Daily Advertiser,
                taking the chronological extent of the archive from the early
                eighteenth century to the late nineteenth.
              </li>
            </ol>
          </section>

          <section className="py-10">
            <h2 className="font-serif text-2xl font-bold text-ink mb-5">
              How this database was developed
            </h2>
            <ul className="space-y-3 list-disc list-outside pl-6 font-serif text-base leading-relaxed text-muted">
              <li>
                The records in the WXDA were located over a period of years using
                both microfilm copies of the Times and the Times online database.
              </li>
              <li>
                For the research conducted on the Times online database, a defined
                search set was developed with which to locate records. The same
                search set was used for all searches with the aim of facilitating a
                consistent and comprehensive capture of cross-dressing records.
              </li>
              <li>
                Given the vagaries of vocabulary in newspaper reports of
                gender-variant dress, problems with typographical elements (broken
                typeface, poor contrast on the original impression), and the limits
                of OCR, no keyword-based search set can guarantee a complete
                recovery of cross-dressing reports in the Times online database.
              </li>
              <li>
                Happily, a comparison of the Times online database search set
                results with the results of searches of the Times in microfilm
                format shows a roughly 95% capture rate with the use of the search
                set as compared with the use of microfilm. Comparison of search set
                results with microfilm results also demonstrates that digital
                searches located some records (&lt;&nbsp;5%) missed in the
                examination of the microfilm format.
              </li>
            </ul>
          </section>

        </article>
      </div>
    </div>
  )
}
