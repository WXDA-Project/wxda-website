# relationship-field-config.ts

Single source of truth for the column names of the `relationships` table. The relationships table stores soft foreign-key links between documents and persons.

---

## How it works

The file exports three string constants — one per column queried by the application. All Supabase `.select()`, `.eq()`, and property access operations on relationship rows must use these constants instead of raw strings, so renaming a column only requires changing it here.

---

## Exported constants

| Constant | Current value | Description |
|---|---|---|
| `RELATIONSHIP_SOURCE_KEY` | `'source_record_pointer'` | ID of the document that is the source of the relationship. Used in `getDocumentEnrichment()` to find persons mentioned in a document, and as the filter column in `getPersonDocuments()`. |
| `RELATIONSHIP_TARGET_KEY` | `'target_record_pointer'` | ID of the person that is the target of the relationship. Used to resolve person IDs from relationship rows. |
| `RELATIONSHIP_TYPE_KEY` | `'relationship_type'` | Human-readable description of the relationship (e.g. `'is Mentioned In'`). Displayed on the record detail page alongside each mentioned person. |

---

## Usage in queries

**`lib/queries/documents.ts` — `getDocumentEnrichment()`**

Fetches all relationships where the document is the source, then resolves the target person IDs:

```ts
supabase
  .from('relationships')
  .select(`${RELATIONSHIP_TYPE_KEY}, ${RELATIONSHIP_TARGET_KEY}`)
  .eq(RELATIONSHIP_SOURCE_KEY, String(documentId))
```

**`lib/queries/persons.ts` — `getPersonDocuments()`**

Fetches all relationships where the person is the target, to find which documents mention them:

```ts
supabase
  .from('relationships')
  .select(RELATIONSHIP_SOURCE_KEY)
  .eq(RELATIONSHIP_TARGET_KEY, String(personId))
```

---

## Renaming a column

Change the constant's value string. All queries update automatically — no other files need to change.
