import type { Metadata } from 'next'
import { getMapPins } from '@/lib/queries'
import DocumentMap from '@/components/DocumentMap'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Map' }

export default async function MapPage() {
  const pins = await getMapPins()
  const docCount = pins.reduce((sum, p) => sum + p.documents.length, 0)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-1 font-serif text-ink">
        Geographic Map
      </h1>
      <p className="text-sm text-muted mb-4">
        {pins.length} locations · {docCount} document reference{docCount !== 1 ? 's' : ''}. Click a pin to see documents.
      </p>
      <div className="border border-border rounded overflow-hidden h-[600px]">
        <DocumentMap pins={pins} />
      </div>
    </div>
  )
}
