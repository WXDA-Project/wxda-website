-- Grant base table/sequence privileges to anon/authenticated, and set
-- default privileges so future migrations inherit them automatically.
--
-- Root cause: this project's local Postgres role bootstrap only grants
-- anon/authenticated DELETE/TRUNCATE/REFERENCES/TRIGGER by default on
-- objects created by the `postgres` role (the role migrations run as) —
-- not SELECT/INSERT/UPDATE. Row Level Security policies alone do not grant
-- access; Postgres requires the base table-level privilege *and* a passing
-- RLS policy. Without this, every anon/authenticated query fails with
-- "permission denied for table <name>", regardless of RLS policies already
-- in place on every table in this project.

grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

alter default privileges in schema public
  grant select on tables to anon, authenticated;

alter default privileges in schema public
  grant insert, update, delete on tables to authenticated;

alter default privileges in schema public
  grant usage, select on sequences to authenticated;
