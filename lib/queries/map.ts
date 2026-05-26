import { cacheLife } from 'next/cache'
import { supabase } from '../supabase'
import { FTS_COLUMN, VISIBILITY_COLUMN, getDocumentConfig } from '../config/db-config'
import { documentDisplayTitle } from './types'
import type { SearchParams } from './documents'

export interface MapPin {
  location: string
  lat: number
  lng: number
  documents: Array<{ id: number; title: string; date: string | null; summary: string | null }>
}

export async function getGeocodedLocations(): Promise<string[]> {
  'use cache'
  cacheLife('hours')
  const { data } = await supabase
    .from('geocode_cache')
    .select('location')
    .not('lat', 'is', null)
  return ((data ?? []) as { location: string }[]).map((r) => r.location)
}

export async function getMapPins(
  params?: Pick<SearchParams, 'q' | 'date_from' | 'date_to' | 'filters'> & {
    /** When set, restricts pins to documents that include this exact location value. */
    locationFocus?: string
  },
): Promise<MapPin[]> {
  const {
    SORT_DATE_KEY, LOCATION_FIELD_KEY, DOC_TITLE_KEY, DOC_NAME_TITLE_KEY, DOC_SUMMARY_KEY,
    MULTISELECT_FILTER_FIELDS,
  } = await getDocumentConfig()

  let docsQuery = supabase
    .from('documents')
    .select(`id, ${DOC_TITLE_KEY}, ${DOC_NAME_TITLE_KEY}, ${DOC_SUMMARY_KEY}, ${SORT_DATE_KEY}, ${LOCATION_FIELD_KEY}`)
    .eq(VISIBILITY_COLUMN, 'public')
    .not(LOCATION_FIELD_KEY, 'is', null)

  if (params?.q?.trim())
    docsQuery = docsQuery.textSearch(FTS_COLUMN, params.q.trim(), { type: 'websearch', config: 'english' })
  if (params?.date_from) docsQuery = docsQuery.gte(SORT_DATE_KEY, params.date_from)
  if (params?.date_to)   docsQuery = docsQuery.lte(SORT_DATE_KEY, params.date_to)
  for (const field of MULTISELECT_FILTER_FIELDS) {
    const vals = params?.filters?.[field.paramKey!] ?? []
    if (vals.length > 0) docsQuery = docsQuery.overlaps(field.key, vals)
  }
  // locationFocus restricts to a single location (used by "View on map" links from record detail)
  if (params?.locationFocus)
    docsQuery = docsQuery.overlaps(LOCATION_FIELD_KEY, [params.locationFocus])

  const [geocodesRes, docsRes] = await Promise.allSettled([
    supabase
      .from('geocode_cache')
      .select('location, lat, lng')
      .not('lat', 'is', null),

    docsQuery,
  ])

  if (geocodesRes.status === 'rejected' || docsRes.status === 'rejected') return []

  const geocodes = (geocodesRes.value.data ?? []) as {
    location: string; lat: number; lng: number
  }[]
  const docs = (docsRes.value.data ?? []) as unknown as Record<string, unknown>[]

  const keys = { DOC_NAME_TITLE_KEY, DOC_TITLE_KEY }

  // When a location filter or focus is active, only assign each document to the
  // matching location(s) — not to every location the document happens to mention.
  const locationFilterField = MULTISELECT_FILTER_FIELDS.find((f) => f.key === LOCATION_FIELD_KEY)
  const activeLocationVals = locationFilterField
    ? (params?.filters?.[locationFilterField.paramKey!] ?? [])
    : []
  const locationRestriction: Set<string> | null =
    params?.locationFocus
      ? new Set([params.locationFocus])
      : activeLocationVals.length > 0
        ? new Set(activeLocationVals)
        : null

  const pinMap = new Map<string, MapPin>()
  for (const g of geocodes) {
    pinMap.set(g.location, { location: g.location, lat: g.lat, lng: g.lng, documents: [] })
  }
  for (const doc of docs) {
    const locs = (doc[LOCATION_FIELD_KEY] as string[] | null) ?? []
    for (const loc of locs) {
      if (locationRestriction && !locationRestriction.has(loc)) continue
      const pin = pinMap.get(loc)
      if (pin) pin.documents.push({
        id: doc.id as number,
        title: documentDisplayTitle(doc, keys, doc.id as number),
        date: doc[SORT_DATE_KEY] as string | null,
        summary: doc[DOC_SUMMARY_KEY] as string | null,
      })
    }
  }

  return Array.from(pinMap.values())
    .filter((p) => p.documents.length > 0)
    .sort((a, b) => a.location.localeCompare(b.location))
}
