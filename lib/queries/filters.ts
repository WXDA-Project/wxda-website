import { unstable_cache } from 'next/cache'
import { supabase } from '../supabase'
import { MULTISELECT_FILTER_FIELDS, VISIBILITY_COLUMN } from '../config/document-field-config'
import { PERSON_MULTISELECT_FILTER_FIELDS } from '../config/person-field-config'

async function fetchFilterOptions(
  table: 'documents' | 'persons',
  fields: Array<{ key: string; isArray?: boolean; paramKey?: string }>,
): Promise<Record<string, string[]>> {
  const results = await Promise.all(
    fields.map(async (field) => {
      const { data } = await supabase
        .from(table)
        .select(field.key)
        .not(field.key, 'is', null)
        .eq(VISIBILITY_COLUMN, 'public')
      const raw = (data ?? []) as unknown as Record<string, string | string[] | null>[]
      const values = field.isArray
        ? [...new Set(raw.flatMap((d) => (d[field.key] as string[] | null) ?? []))]
        : [...new Set(raw.map((d) => d[field.key] as string).filter(Boolean))]
      return [field.paramKey!, values.sort()] as const
    }),
  )
  return Object.fromEntries(results)
}

/** Distinct values for all document multiselect filters, cached for 1 hour. */
export const getDocumentFilterOptions = unstable_cache(
  () => fetchFilterOptions('documents', MULTISELECT_FILTER_FIELDS),
  ['wxda-document-filter-options'],
  { revalidate: 3600 },
)

/** Distinct values for all person multiselect filters, cached for 1 hour. */
export const getPersonFilterOptions = unstable_cache(
  () => fetchFilterOptions('persons', PERSON_MULTISELECT_FILTER_FIELDS),
  ['wxda-person-filter-options'],
  { revalidate: 3600 },
)
