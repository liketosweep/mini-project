-- ==============================================================================
-- Fix #2 (follow-up): mutual recursion between `rooms` and `room_participants`.
--
-- 03_fix_recursion_and_habit_grants.sql fixed room_participants' *self*-
-- recursion, but its replacement policy still checked rooms.creator_id
-- directly -- and rooms' policy checks room_participants directly. That's a
-- 2-table cycle: reading rooms evaluates room_participants' policy, which
-- evaluates rooms' policy again, forever (42P17, now reported against
-- "rooms" instead of "room_participants").
--
-- Fix: every cross-table membership/ownership check goes through a
-- SECURITY DEFINER function, which runs as the function owner and bypasses
-- RLS on the table it queries. Neither policy ever triggers the other
-- policy's evaluation, so the cycle is broken for good.
-- ==============================================================================

create or replace function public.is_room_creator(p_room_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.rooms
    where id = p_room_id and creator_id = p_user_id
  );
$$;

revoke all on function public.is_room_creator from public;
grant execute on function public.is_room_creator to authenticated;

-- rooms: no longer queries room_participants directly, uses the helper
drop policy if exists "Users can view rooms they created or joined" on public.rooms;
create policy "Users can view rooms they created or joined"
  on public.rooms for select
  to authenticated
  using (
    creator_id = auth.uid()
    or public.is_room_participant(id, auth.uid())
  );

-- room_participants: no longer queries rooms directly, uses the helper
drop policy if exists "Participants can view room roster" on public.room_participants;
create policy "Participants can view room roster"
  on public.room_participants for select
  to authenticated
  using (
    public.is_room_participant(room_id, auth.uid())
    or public.is_room_creator(room_id, auth.uid())
  );

-- room_logs: was already only checking room_participants, but route it
-- through the same bypass-RLS helper for consistency and safety
drop policy if exists "Participants can view room check-ins" on public.room_logs;
create policy "Participants can view room check-ins"
  on public.room_logs for select
  to authenticated
  using (
    public.is_room_participant(room_id, auth.uid())
  );
