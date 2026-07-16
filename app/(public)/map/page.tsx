import type { Metadata } from 'next'
import { Suspense } from 'react'
import {
  getMapPins,
  getDocumentFilterOptions,
  getDocumentFacetCounts,
  getGeocodedLocations,
  getContainerFilterOptions,
  getContainerFacetCounts,
} from '@/lib/queries'
import { getDocumentConfig, requireField } from '@/lib/config/db-config'
import DocumentMap from '@/components/DocumentMap'
import SearchFilters from '@/components/SearchFilters'
import ActiveFilters from '@/components/ActiveFilters'

export const metadata: Metadata = { title: 'Map' }

function normalise(v: string | string[] | undefined): string[] {
  if (!v) return []
  return Array.isArray(v) ? v : [v]
}

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams

  const { FILTER_FIELDS, DATE_FILTER_FIELD, MULTISELECT_FILTER_FIELDS, FIELDS } = await getDocumentConfig()
  const CONTAINER_FILTER_LABEL = requireField(FIELDS, 'container-ref', 'document_field_config').label
  const CONTAINER_PARAM_KEY = 'container'

  const date_from = (sp.date_from as string | undefined) ?? undefined
  const date_to = (sp.date_to as string | undefined) ?? undefined
  const focus = (sp.focus as string | undefined) ?? undefined

  const filters: Record<string, string[]> = {}
  for (const field of MULTISELECT_FILTER_FIELDS) {
    const vals = normalise(sp[field.paramKey!])
    if (vals.length > 0) filters[field.paramKey!] = vals
  }
  const containerIds = normalise(sp[CONTAINER_PARAM_KEY])

  // getGeocodedLocations is cached — fetch it first so we can restrict facet counts
  // to only documents that actually appear on the map.
  const geocodedLocations = await getGeocodedLocations()
  const locationRestriction = focus ? [focus] : geocodedLocations

  const [pins, filterOptions, filterCounts, containerOptions, containerCounts] = await Promise.all([
    getMapPins({ date_from, date_to, filters, containerIds, locationFocus: focus }),
    getDocumentFilterOptions(),
    getDocumentFacetCounts({ date_from, date_to, filters, containerIds }, { locationRestriction }),
    getContainerFilterOptions(),
    getContainerFacetCounts({ date_from, date_to, filters, containerIds }),
  ])

  const docCount = pins.reduce((sum, p) => sum + p.documents.length, 0)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-1 font-serif text-ink">
        Geographic Map
      </h1>
      <p className="text-sm text-muted mb-4">
        {pins.length} location{pins.length !== 1 ? 's' : ''} · {docCount} document reference{docCount !== 1 ? 's' : ''}. Click a pin to see documents.
      </p>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        
        {/* Filter sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <Suspense>
            <SearchFilters
              filterFields={FILTER_FIELDS}
              dateFilterField={DATE_FILTER_FIELD}
              filterOptions={filterOptions}
              filterCounts={filterCounts}
              basePath="/map"
              showKeywordSearch={false}
              containerFilter={{
                label: CONTAINER_FILTER_LABEL,
                paramKey: CONTAINER_PARAM_KEY,
                options: containerOptions,
                counts: containerCounts,
              }}
            />
          </Suspense>
        </div>

        {/* Map */}
        <div className="flex-1 min-w-0">
          <Suspense>
            <ActiveFilters
              multiselectFields={MULTISELECT_FILTER_FIELDS}
              containerFilter={{
                label: CONTAINER_FILTER_LABEL,
                paramKey: CONTAINER_PARAM_KEY,
                labels: Object.fromEntries(containerOptions.map((o) => [o.id, o.label])),
              }}
            />
          </Suspense>
          <div className="border border-border rounded overflow-hidden h-[500px] sm:h-[600px] isolate">
            <DocumentMap pins={pins} focus={focus} />
          </div>
        </div>
      </div>
    </div>
  )
}
