/**
 * RELATIONSHIP FIELD CONFIG — single source of truth for the relationships table.
 *
 * The relationships table stores soft FK links between documents and persons.
 * To rename a column, change the constant here — all queries update automatically.
 */

/** Document ID that is the source of the relationship */
export const RELATIONSHIP_SOURCE_KEY = 'source_record_pointer'
/** Person ID that is the target of the relationship */
export const RELATIONSHIP_TARGET_KEY = 'target_record_pointer'
/** Human-readable description of the relationship type */
export const RELATIONSHIP_TYPE_KEY   = 'relationship_type'
