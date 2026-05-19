'use client'

import { useRouter } from 'next/navigation'

interface TabNavProps {
  activeTab: 'records' | 'persons'
  recordsHref: string
  personsHref: string
}

export default function TabNav({ activeTab, recordsHref, personsHref }: TabNavProps) {
  const router = useRouter()

  const btnClass = (active: boolean) =>
    [
      'py-1.5 px-4 text-[0.8125rem] border border-border rounded-t -mb-px relative cursor-pointer transition-colors',
      active
        ? 'font-bold border-b-paper bg-paper text-ink z-[1]'
        : 'font-normal border-b-border bg-transparent text-muted z-0',
    ].join(' ')

  return (
    <nav aria-label="Search type" className="mb-6">
      <div className="flex gap-1 border-b border-border">
        <button
          type="button"
          onClick={() => router.push(recordsHref)}
          className={btnClass(activeTab === 'records')}
        >
          Records
        </button>
        <button
          type="button"
          onClick={() => router.push(personsHref)}
          className={btnClass(activeTab === 'persons')}
        >
          Persons
        </button>
      </div>
    </nav>
  )
}
