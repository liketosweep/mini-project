-- ==============================================================================
-- Fix: Missing table-level GRANTs for the `authenticated` role.
--
-- Root cause: 01_init.sql created tables and RLS policies, but never ran the
-- table-level GRANT statements that schema.sql documents as required
-- ("Automatically expose new tables" is disabled on this project). Without
-- these grants, Postgres rejects any query that even references these tables
-- (including inside another table's RLS policy, e.g. rooms -> room_participants),
-- regardless of whether the RLS policy itself would allow the row. This is why
-- rooms could be created/joined via the SECURITY DEFINER RPCs (which bypass
-- grants) but never appeared when read back with a normal client-side select.
--
-- This migration is idempotent and safe to run even if some grants already exist.
-- ==============================================================================

grant select on public.profiles to authenticated;
grant select on public.habits to authenticated;
grant select on public.habit_logs to authenticated;
grant select on public.rooms to authenticated;
grant select on public.room_participants to authenticated;
grant select on public.room_logs to authenticated;
