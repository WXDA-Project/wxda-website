import { cacheLife } from 'next/cache'
import { supabase } from '../supabase'
import { VISIBILITY_COLUMN, getDocumentConfig, getPersonConfig } from '../config/db-config'

async function fetchFilterOptions(
  table: 'documents' | 'persons',
  fields: Array<{ key: string; isArray?: boolean; paramKey?: string | null }>,
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

export async function getDocumentFilterOptions(): Promise<Record<string, string[]>> {
  'use cache'
  cacheLife('hours')
  const { MULTISELECT_FILTER_FIELDS } = await getDocumentConfig()
  return fetchFilterOptions('documents', MULTISELECT_FILTER_FIELDS)
}

export async function getPersonFilterOptions(): Promise<Record<string, string[]>> {
  'use cache'
  cacheLife('hours')
  const { PERSON_MULTISELECT_FILTER_FIELDS } = await getPersonConfig()
  return fetchFilterOptions('persons', PERSON_MULTISELECT_FILTER_FIELDS)
}
