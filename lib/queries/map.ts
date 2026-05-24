import { supabase } from '../supabase'
import {
  VISIBILITY_COLUMN,
  SORT_DATE_KEY,
  LOCATION_FIELD_KEY,
  DOC_TITLE_KEY,
  DOC_NAME_TITLE_KEY,
} from '../config/document-field-config'
import { documentDisplayTitle } from './types'

// ── Types ──────────────────────────────────────────────────────────────────

export interface MapPin {
  location: string
  lat: number
  lng: number
  documents: Array<{ id: number; title: string; date: string | null }>
}

// ── Query ──────────────────────────────────────────────────────────────────

export async function getMapPins(): Promise<MapPin[]> {
  const [geocodesRes, docsRes] = await Promise.allSettled([
    supabase
      .from('geocode_cache')
      .select('location, lat, lng')
      .not('lat', 'is', null),

    supabase
      .from('documents')
      .select(`id, ${DOC_TITLE_KEY}, ${DOC_NAME_TITLE_KEY}, ${SORT_DATE_KEY}, ${LOCATION_FIELD_KEY}`)
      .eq(VISIBILITY_COLUMN, 'public')
      .not(LOCATION_FIELD_KEY, 'is', null),
  ])

  if (geocodesRes.status === 'rejected' || docsRes.status === 'rejected') return []

  const geocodes = (geocodesRes.value.data ?? []) as {
    location: string; lat: number; lng: number
  }[]
  const docs = (docsRes.value.data ?? []) as unknown as Record<string, unknown>[]

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
        title: documentDisplayTitle(doc, doc.id as number),
        date: doc[SORT_DATE_KEY] as string | null,
      })
    }
  }

  return Array.from(pinMap.values())
    .filter((p) => p.documents.length > 0)
    .sort((a, b) => a.location.localeCompare(b.location))
}
