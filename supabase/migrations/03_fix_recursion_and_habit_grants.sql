-- ==============================================================================
-- Fix #1: Infinite recursion in room_participants' own SELECT policy.
--
-- The old policy queried `room_participants` from inside its own USING clause
-- to check membership. Postgres has to re-run that same policy to evaluate the
-- subquery, which re-runs the subquery, forever -> error 42P17
-- "infinite recursion detected in policy for relation room_participants".
-- Because `rooms` and `room_logs` both check membership by querying
-- room_participants, this single bad policy broke every room read in the app.
--
-- Fix: move the self-check into a SECURITY DEFINER helper function. Functions
-- run with the privileges of their owner, which bypasses RLS on tables it owns
-- (RLS is only skipped for the owner unless FORCE ROW LEVEL SECURITY is set,
-- which it isn't here), so the internal lookup no longer re-triggers the
-- policy that's calling it.
-- ==============================================================================

create or replace function public.is_room_participant(p_room_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.room_participants
    where room_id = p_room_id and user_id = p_user_id
  );
$$;

revoke all on function public.is_room_participant from public;
grant execute on function public.is_room_participant to authenticated;

drop policy if exists "Participants can view room roster" on public.room_participants;
create policy "Participants can view room roster"
  on public.room_participants for select
  to authenticated
  using (
    public.is_room_participant(room_id, auth.uid())
    or exists (
      select 1 from public.rooms r
      where r.id = room_participants.room_id and r.creator_id = auth.uid()
    )
  );

-- ==============================================================================
-- Fix #2: Missing write grants on `habits`.
--
-- Habit creation, editing, archiving, and unarchiving all write to `habits`
-- directly from the client (there's no RPC for these, unlike rooms/check-ins),
-- but only SELECT was ever granted to `authenticated`. This caused
-- "permission denied for table habits" on every create/edit/archive attempt.
-- ==============================================================================

grant insert, update on public.habits to authenticated;
