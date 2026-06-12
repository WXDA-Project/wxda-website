import type { Metadata } from 'next'
import Link from 'next/link'
import HomeSearchBar from '@/components/HomeSearchBar'
import RandomEntryButton from '@/components/RandomEntryButton'
import { NEWS } from './about/news/news'

export const metadata: Metadata = {
  title: 'Waterloo Cross-Dressing Archive',
}

export default function HomePage() {
  return (
    <div className="bg-parchment min-h-full">

      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col items-center text-center gap-6">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight font-serif text-ink">
            Waterloo Cross-Dressing Archive
          </h1>
          <p className="text-base sm:text-lg text-muted max-w-[38rem]">
            A scholarly archive of historical documents relating to cross-dressing and gender
            non-conformity in the English-language press, 1785&#x2013;1848.
          </p>
          <div className="w-full max-w-xl">
            <HomeSearchBar />
          </div>
          <p className="text-sm text-muted -mt-2">
            <Link href="/search">Browse the archive</Link>
            {' '} or {' '}
            <RandomEntryButton />.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

          <div className="lg:flex-1 min-w-0">
            <h2 className="font-serif text-xl font-bold text-ink mb-5 pb-2 border-b-2 border-ink">
              Welcome
            </h2>
            <div className="font-serif text-base leading-relaxed text-muted space-y-5">
              <p>
                Welcome to the Waterloo Cross-Dressing Archive. This website gives you
                access to a growing database of eighteenth- and nineteenth-century periodical
                records of the real-world adoption of gender-variant garb. By
                &#8220;cross-dressing,&#8221; we refer to material practices involving the
                adoption of gender-variant clothing, including for the purposes of expressing
                one&#8217;s gender.
              </p>
              <p>
                If you were living around 1800 and made the decision to adopt differently
                gendered garb, how would someone in the future know about what you did, why
                you did it, or how you felt about doing it? How would your actions have been
                understood at the time, and how may we understand them now? This archive is
                meant to collect records that will help us explore, and seek answers to,
                these questions.
              </p>
              <p>
                Consider, for example, a report from February 1786 about the death of a
                &#8220;woman&#8221; who &#8220;constantly appeared in the disguise of man&#8217;s
                apparel&#8221; for over 30 years while working as a shepherd and paver, who
                proposed marriage &#8220;to several young women,&#8221; and who, if only they
                had found &#8220;a professional man in whom she could have safely reposed
                confidence,&#8221; would have gone to their death known only as a man. Was
                this cross-dressing instrumental (to work as a man), sexual (to pursue other
                women), transgender (to be a man)?{' '}
                <Link href="/record/563">
                  Take a look at the WXDA records
                </Link>{' '}
                and the{' '}
                <a
                  href="https://go.gale.com/ps/i.do?p=TTDA&u=uniwater&id=GALE|CS33817173&v=2.1&it=r&sid=TTDA&asid=b4577f62"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  original newspaper report
                </a>{' '}
                to explore this matter for yourself.
              </p>
              <p>
                Follow the WXDA on{' '}
                <a
                  href="https://twitter.com/WXDAproject"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </a>{' '}
                for updates and additional information.
              </p>
              <p className="font-semibold text-ink">Happy searching!</p>
            </div>
          </div>

          <aside className="lg:w-72 shrink-0">
            <h2 className="font-serif text-xl font-bold text-ink mb-5 pb-2 border-b-2 border-ink">
              What&#8217;s new on the WXDA?
            </h2>
            <ol className="list-none m-0 p-0 space-y-0 divide-y divide-border">
              {NEWS.slice(0, 5).map(({ date, text }) => (
                <li key={date} className="py-3 text-sm">
                  <time
                    dateTime={date}
                    className="block font-semibold text-ink font-sans text-xs tracking-wide mb-0.5"
                  >
                    {date}
                  </time>
                  <span className="font-serif text-muted leading-snug">{text}</span>
                </li>
              ))}
            </ol>
            <div className="mt-4">
              <Link href="/about/news" className="text-sm no-underline">
                See all news →
              </Link>
            </div>
          </aside>

        </div>
      </div>

    </div>
  )
}
