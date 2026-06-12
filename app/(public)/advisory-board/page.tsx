import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Advisory Board — Waterloo Cross-Dressing Archive',
  description:
    'Meet the scholars who advise the Waterloo Cross-Dressing Archive project.',
}

const advisors = [
  {
    name: 'Katherine Binhammer',
    url: 'https://apps.ualberta.ca/directory/person/kb1',
    bio: 'Katherine is a Professor in the Department of English and Film Studies at the University of Alberta and author of Downward Mobility: The Form of Capital in the Sentimental Novel (2020) and The Seduction Narrative in Britain, 1747–1800 (2009). Her essays in queer and gender studies have appeared in Feminist Studies, GLQ, ELH, Literature Compass, and The Journal of the History of Sexuality. Katherine is currently Literary Director of The Orlando Project.',
  },
  {
    name: 'Simon Burrows',
    url: 'https://researchers.westernsydney.edu.au/en/persons/simon-burrows/',
    bio: 'Simon is a Professor of History and Digital Humanities at Western Sydney University. He is known for his innovative studies of the press and French exile writers in Britain and above all as the principal investigator of the award-winning AHRC-funded "French Book Trade in Enlightenment Europe" (FBTEE) database project. Simon is the author or editor of eight books, including a co-edited volume on cross-dressing French diplomat, the chevalière d\'Eon, and more than 50 chapters and articles.',
  },
  {
    name: 'Jeremy Chow',
    url: 'https://www.bucknell.edu/fac-staff/jeremy-chow',
    bio: 'An assistant professor of English at Bucknell University (USA), Jeremy\'s research and teaching interests include British literature of the long eighteenth century, queer and sexuality studies, and the environmental humanities. He is editor of Eighteenth-Century Environmental Humanities (2023) and author of The Queerness of Water: Troubled Ecologies in the Eighteenth Century (2023).',
  },
  {
    name: 'Ula Lukszo Klein',
    url: 'https://ulalukszoklein.weebly.com/',
    bio: 'Ula is Associate Professor of English and Director of Women\'s and Gender Studies at the University of Wisconsin Oshkosh. Her book Sapphic Crossings: Cross-Dressing Women in Eighteenth-Century British Literature (UVa Press, 2021) considers how eighteenth-century writers and reading publics understood sapphic desire as a function of cross-gender embodiments and gender fluid body parts. She is currently working on essays on the Ladies of Llangollen as well as the chevalière d\'Eon.',
  },
  {
    name: 'M. A. Miller',
    url: 'https://english.wsu.edu/faculty-staff/wsu-profile/m.a.miller/',
    bio: 'M. A. is an Assistant Professor of Gender, Race, and Health in the program of Women\'s, Gender, and Sexuality Studies at Washington State University. They have forthcoming publications in a special issue on "Transing Romanticism" in European Romantic Review, The Edinburgh University Press Companion to Queer Reading, Trans Ecocriticism: Animality, Embodiment, and Environment in Transgender Literature, The Oxford Handbook to Queer Modernisms, The Routledge Handbook of Trans Literature, and The Handbook of Transgender Science Fiction. M.A. is currently working on two academic monographs, "Trans*-imperial Ecologies: Cultivating the Ideal Trans Subject" and "Gender Unconformities: Deep Time\'s Racial Matters" as well as a hybrid-memoir: "Life/Forms/At/Boundaries: A Trans*-Ecology."',
  },
  {
    name: 'Ray Siemens',
    url: 'https://www.uvic.ca/humanities/english/people/regularfaculty/siemens-raymond.php',
    bio: 'A Distinguished Professor in the Department of English at the University of Victoria, Ray is a pioneer in the field of digital humanities, both in Canada and internationally. His research interests comprehend early Tudor poetry and Renaissance literature, digital humanities, book history, scholarly editing, pedagogy, and scholarly communication. Currently, Ray directs the Electronic Textual Cultures Lab, the Implementing New Knowledge Environments Project, and the Digital Humanities Summer Institute at the University of Victoria.',
  },
]

export default function AdvisoryBoardPage() {
  return (
    <div className="bg-parchment min-h-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        <header className="mb-10">
          <p className="text-xs tracking-widest uppercase text-muted font-sans mb-3">
            Waterloo Cross-Dressing Archive &middot; University of Waterloo
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink leading-tight">
            Advisory Board
          </h1>
          <div className="mt-5 border-t-2 border-ink" />
          <p className="mt-7 font-serif text-base sm:text-lg text-muted leading-relaxed">
            The Waterloo Cross-Dressing Archive is guided by a distinguished
            group of scholars whose expertise spans literary history, digital
            humanities, and queer and gender studies.
          </p>
        </header>

        <ul className="list-none m-0 p-0 border-t border-border divide-y divide-border">
          {advisors.map((advisor) => (
            <li key={advisor.name} className="py-8">
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-ink leading-snug mb-3">
                <Link
                  href={advisor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline hover:text-crimson transition-colors"
                >
                  {advisor.name}
                </Link>
              </h2>
              <p className="font-serif text-base leading-relaxed text-muted">
                {advisor.bio}
              </p>
            </li>
          ))}
        </ul>

      </div>
    </div>
  )
}
