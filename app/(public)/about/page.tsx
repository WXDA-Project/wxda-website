import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — Waterloo Cross-Dressing Archive',
  description:
    'About the Waterloo Cross-Dressing Archive, a project directed by Professor Fraser Easton at the University of Waterloo.',
}

export default function AboutPage() {
  return (
    <div className="bg-parchment min-h-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        <header className="mb-10">
          <p className="text-xs tracking-widest uppercase text-muted font-sans mb-3">
            Waterloo Cross-Dressing Archive &middot; University of Waterloo
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink leading-tight">
            About the Project
          </h1>
          <div className="mt-5 border-t-2 border-ink" />
        </header>

        <article className="text-ink">

          <section className="pb-10 border-b border-border">
            <p className="font-serif text-base sm:text-lg leading-relaxed">
              The WXDA is part of a larger project directed by{' '}
              <a
                href="https://uwaterloo.ca/english/profiles/fraser-easton"
                className="text-crimson underline hover:text-crimson-hover"
                target="_blank"
                rel="noopener noreferrer"
              >
                Professor Fraser Easton
              </a>{' '}
              that aims to map and make visible a wide range of
              eighteenth- and nineteenth-century cross-dressing practices, and
              the complex ways in which those practices were represented across
              historical periods, report genres, and different sexes and
              genders, especially in periodical reports.
            </p>
            <p className="font-serif text-base sm:text-lg leading-relaxed mt-5">
              For enquiries about the WXDA, please email us at{' '}
              <a
                href="mailto:wxda@uwaterloo.ca"
                className="text-crimson underline hover:text-crimson-hover"
              >
                wxda@uwaterloo.ca
              </a>
              . You can also follow us on Twitter at{' '}
              <a
                href="https://twitter.com/WXDAproject"
                className="text-crimson underline hover:text-crimson-hover"
                target="_blank"
                rel="noopener noreferrer"
              >
                @WXDAproject
              </a>
              .
            </p>
          </section>

          <section className="py-10 border-b border-border">
            <h2 className="font-serif text-2xl font-bold text-ink mb-5">
              Acknowledgements
            </h2>
            <div className="font-serif text-base leading-relaxed space-y-4 text-muted">
              <p>
                The creation of the WXDA and, separately, the location of
                cross-dressing records from the Times of London, has been
                supported by the contributions of several research assistants
                and others.
              </p>
              <p>
                Location of cross-dressing records in the Times was made
                possible in part by research assistance from Y-Dang Troeung,
                Christine Barbara Frim, Karl Ponthieux Stern, Cheuk Huen
                Lee (李卓萱), Jo-Ann Bonnett, and Andy Xu. The late Dr. Troeung also helped develop the
                search set used in the identification of records in the Times
                digital database. The Waterloo_Cross_Dressing_Archive database
                content (to which this website gives access), including
                summaries, analytic categories (fields), and record metatags
                (values), was created with research assistance from Isabelle
                Joyce Weigel-Mohamed and Mr. Ponthieux Stern.
                Professor Ian Johnson provided database layout support, and
                Professor Simon Burrows provided database advice.
              </p>
              <p>
                For help with the website, Professor Easton wishes to thank Andy
                Xu, Camie Kim, and Isabelle Joyce Weigel-Mohamed.
              </p>
              <p>
                Some of the research for this project was made possible by a
                SSHRC Insight Grant, a UW/SSHRC Explore Grant, and by the
                MITACS Globalink Internship program.
              </p>
            </div>
          </section>

          <section className="py-10">
            <h2 className="font-serif text-2xl font-bold text-ink mb-5">
              Coverage
            </h2>
            <p className="font-serif text-base leading-relaxed text-muted">
              Current years on the WXDA: 1785&#x2013;87, 1801&#x2013;02, 1833,
              and 1848. Additional years will be added as time and resources
              permit.
            </p>
            <dl className="mt-6 text-sm font-sans border-t border-border pt-5 space-y-2">
<div className="flex gap-3">
                <dt className="font-semibold text-ink w-28 shrink-0">Version</dt>
                <dd className="text-muted">24 June 2026</dd>
              </div>
            </dl>
          </section>

        </article>
      </div>
    </div>
  )
}
