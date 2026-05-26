import { supabase } from '../supabase'
import { VISIBILITY_COLUMN, getDocumentConfig } from '../config/db-config'
import { documentDisplayTitle } from './types'

export interface MapPin {
  location: string
  lat: number
  lng: number
  documents: Array<{ id: number; title: string; date: string | null; summary: string | null }>
}

export async function getMapPins(): Promise<MapPin[]> {
  const { SORT_DATE_KEY, LOCATION_FIELD_KEY, DOC_TITLE_KEY, DOC_NAME_TITLE_KEY, DOC_SUMMARY_KEY } =
    await getDocumentConfig()

  const [geocodesRes, docsRes] = await Promise.allSettled([
    supabase
      .from('geocode_cache')
      .select('location, lat, lng')
      .not('lat', 'is', null),

    supabase
      .from('documents')
      .select(`id, ${DOC_TITLE_KEY}, ${DOC_NAME_TITLE_KEY}, ${DOC_SUMMARY_KEY}, ${SORT_DATE_KEY}, ${LOCATION_FIELD_KEY}`)
      .eq(VISIBILITY_COLUMN, 'public')
      .not(LOCATION_FIELD_KEY, 'is', null),
  ])

  if (geocodesRes.status === 'rejected' || docsRes.status === 'rejected') return []

  const geocodes = (geocodesRes.value.data ?? []) as {
    location: string; lat: number; lng: number
  }[]
  const docs = (docsRes.value.data ?? []) as unknown as Record<string, unknown>[]

  const keys = { DOC_NAME_TITLE_KEY, DOC_TITLE_KEY }
  const pinMap = new Map<string, MapPin>()
  for (const g of geocodes) {
    pinMap.set(g.location, { location: g.location, lat: g.lat, lng: g.lng, documents: [] })
  }
  for (const doc of docs) {
    const locs = (doc[LOCATION_FIELD_KEY] as string[] | null) ?? []
    for (const loc of locs) {
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
