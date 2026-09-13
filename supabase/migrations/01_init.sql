-- ==============================================================================
-- Habit Arena V1: Database Schema, Security Policies & Atomic Procedures
-- Unlimited Virtual Points Model (Zero balance blockers, competitive rewards)
-- Hardened Write-Access Model: Direct client INSERTs into challenge tables blocked.
-- Writes are strictly enforced through atomic SECURITY DEFINER RPCs.
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "pgcrypto";

-- 2. TYPES
do $$
begin
  if not exists (select 1 from pg_type where typname = 'room_status') then
    create type room_status as enum ('recruiting', 'active', 'completed', 'cancelled');
  end if;
end
$$;

-- 3. PROFILES (Extends auth.users; stores earned virtual points)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  virtual_points integer default 0 check (virtual_points >= 0) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 4. SOLO HABITS
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category text default 'General' not null,
  is_archived boolean default false not null,
  current_streak integer default 0 check (current_streak >= 0) not null,
  longest_streak integer default 0 check (longest_streak >= 0) not null,
  last_completed_date date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 5. SOLO HABIT LOGS (Strictly 1 check-in per habit per calendar day)
create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references public.habits(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  check_in_date date not null,
  note text,
  created_at timestamptz default now() not null,
  constraint unique_habit_daily_checkin unique (habit_id, check_in_date)
);

-- 6. PRIVATE CHALLENGE ROOMS (Strictly invite-only; zero public discovery)
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  habit_title text not null,
  invite_code text unique not null,
  entry_points integer default 0 check (entry_points >= 0) not null,
  points_pool integer default 0 check (points_pool >= 0) not null,
  acceptance_deadline timestamptz not null,
  start_date date not null,
  end_date date not null,
  status room_status default 'recruiting' not null,
  created_at timestamptz default now() not null,
  constraint valid_dates check (start_date <= end_date)
);

-- 7. ROOM PARTICIPANTS (1 check-in = 1 point; final locked ranks)
create table if not exists public.room_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  points integer default 0 check (points >= 0) not null,
  final_rank integer,
  payout_received integer default 0 not null,
  joined_at timestamptz default now() not null,
  constraint unique_room_participant unique (room_id, user_id)
);

-- 8. ROOM LOGS (Strictly 1 check-in per participant per day)
create table if not exists public.room_logs (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  check_in_date date not null,
  note text,
  created_at timestamptz default now() not null,
  constraint unique_room_daily_checkin unique (room_id, user_id, check_in_date)
);

-- 9. INDEXES
create index if not exists idx_habits_user on public.habits (user_id);
create index if not exists idx_habit_logs_user_date on public.habit_logs (user_id, check_in_date);
create index if not exists idx_rooms_invite_code on public.rooms (invite_code);
create index if not exists idx_room_participants_room_points on public.room_participants (room_id, points desc);
create index if not exists idx_room_logs_room_date on public.room_logs (room_id, check_in_date);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.rooms enable row level security;
alter table public.room_participants enable row level security;
alter table public.room_logs enable row level security;

-- PROFILES
drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Column privilege security: Authenticated clients can only update username/display_name
-- virtual_points can ONLY be modified by internal SECURITY DEFINER functions (e.g. finalize_room_standings)
revoke update on public.profiles from authenticated;
grant update (username, display_name, updated_at) on public.profiles to authenticated;

-- SOLO HABITS: 100% private to the owner
drop policy if exists "Users can manage their own habits" on public.habits;
create policy "Users can manage their own habits"
  on public.habits for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- SOLO HABIT LOGS: Viewable and removable by the owner
drop policy if exists "Users can view their own habit logs" on public.habit_logs;
create policy "Users can view their own habit logs"
  on public.habit_logs for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own habit logs" on public.habit_logs;
create policy "Users can delete their own habit logs"
  on public.habit_logs for delete
  to authenticated
  using (auth.uid() = user_id);

-- Note: Habit daily check-ins are recorded via check_in_solo_habit() to ensure streak integrity.
-- If direct insert is needed as a fallback, it is restricted to the owner:
drop policy if exists "Users can insert their own habit logs" on public.habit_logs;
create policy "Users can insert their own habit logs"
  on public.habit_logs for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ROOMS: SELECT ONLY (No direct INSERT or UPDATE from client)
-- Zero public browsing: only creator and participants can read
drop policy if exists "Users can view rooms they created or joined" on public.rooms;
create policy "Users can view rooms they created or joined"
  on public.rooms for select
  to authenticated
  using (
    creator_id = auth.uid() or
    exists (
      select 1 from public.room_participants rp
      where rp.room_id = rooms.id and rp.user_id = auth.uid()
    )
  );

-- Direct client INSERT into public.rooms is BLOCKED.
-- Clients MUST call create_challenge_room() to enforce atomic creation and initial pool setup.
drop policy if exists "Users can insert rooms" on public.rooms;

-- Direct client UPDATE into public.rooms is BLOCKED.
-- Room status and pool can only be updated by atomic RPCs.
drop policy if exists "Creators can update their rooms" on public.rooms;

-- ROOM PARTICIPANTS: SELECT ONLY (No direct INSERT or UPDATE from client)
drop policy if exists "Participants can view room roster" on public.room_participants;
create policy "Participants can view room roster"
  on public.room_participants for select
  to authenticated
  using (
    exists (
      select 1 from public.room_participants rp
      where rp.room_id = room_participants.room_id and rp.user_id = auth.uid()
    ) or
    exists (
      select 1 from public.rooms r
      where r.id = room_participants.room_id and r.creator_id = auth.uid()
    )
  );

-- Direct client INSERT into public.room_participants is BLOCKED.
-- Clients MUST call join_challenge_room() to enforce deadline, recruiting state, and pool updates.
drop policy if exists "Users can join rooms" on public.room_participants;

-- ROOM LOGS: SELECT ONLY (No direct INSERT or UPDATE from client)
drop policy if exists "Participants can view room check-ins" on public.room_logs;
create policy "Participants can view room check-ins"
  on public.room_logs for select
  to authenticated
  using (
    exists (
      select 1 from public.room_participants rp
      where rp.room_id = room_logs.room_id and rp.user_id = auth.uid()
    )
  );

-- Direct client INSERT into public.room_logs is BLOCKED.
-- Clients MUST call check_in_room() to enforce active room checks, date validation, and +1 leaderboard points.
drop policy if exists "Participants can insert their check-ins" on public.room_logs;

-- ==============================================================================
-- AUTOMATIC AUTH TRIGGER: USER PROFILE CREATION
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, username, display_name, virtual_points)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    0
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- ATOMIC POSTGRESQL FUNCTIONS & RPCS (HARDENED SECURITY DEFINER)
-- ==============================================================================

-- 1. Create Challenge Room (The SOLE write path for creating rooms)
create or replace function public.create_challenge_room(
  p_name text,
  p_description text,
  p_habit_title text,
  p_invite_code text,
  p_entry_points integer,
  p_acceptance_deadline timestamptz,
  p_start_date date,
  p_end_date date
) returns uuid
language plpgsql
security definer set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_room_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_start_date > p_end_date then
    raise exception 'Start date must be before or equal to end date';
  end if;

  if p_entry_points < 0 then
    raise exception 'Entry points cannot be negative';
  end if;

  insert into public.rooms (
    creator_id, name, description, habit_title, invite_code,
    entry_points, points_pool, acceptance_deadline, start_date, end_date, status
  ) values (
    v_user_id, p_name, p_description, p_habit_title, p_invite_code,
    p_entry_points, p_entry_points, p_acceptance_deadline, p_start_date, p_end_date, 'recruiting'
  ) returning id into v_room_id;

  insert into public.room_participants (room_id, user_id, points, joined_at)
  values (v_room_id, v_user_id, 0, now());

  return v_room_id;
end;
$$;

-- 2. Join Challenge Room (The SOLE write path for joining rooms)
create or replace function public.join_challenge_room(p_invite_code text)
returns uuid
language plpgsql
security definer set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_room record;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select id, entry_points, acceptance_deadline, status
  into v_room
  from public.rooms
  where invite_code = p_invite_code
  for update;

  if not found then
    raise exception 'Room not found with provided code';
  end if;

  if v_room.status != 'recruiting' then
    raise exception 'Room is no longer accepting new participants';
  end if;

  if now() > v_room.acceptance_deadline then
    raise exception 'Acceptance deadline has passed';
  end if;

  if exists (select 1 from public.room_participants where room_id = v_room.id and user_id = v_user_id) then
    raise exception 'Already joined this room';
  end if;

  -- Increment virtual pool for competitive display
  if v_room.entry_points > 0 then
    update public.rooms
    set points_pool = points_pool + v_room.entry_points
    where id = v_room.id;
  end if;

  insert into public.room_participants (room_id, user_id, points, joined_at)
  values (v_room.id, v_user_id, 0, now());

  return v_room.id;
end;
$$;

-- 3. Minimal Room Preview by Invite Code (Zero public discovery, private preview)
create or replace function public.get_room_preview_by_invite(p_invite_code text)
returns table (
  room_id uuid,
  name text,
  description text,
  habit_title text,
  entry_points integer,
  acceptance_deadline timestamptz,
  start_date date,
  end_date date,
  participant_count bigint,
  is_deadline_passed boolean
)
language plpgsql
security definer set search_path = public, pg_temp
as $$
begin
  return query
  select
    r.id,
    r.name,
    r.description,
    r.habit_title,
    r.entry_points,
    r.acceptance_deadline,
    r.start_date,
    r.end_date,
    (select count(*) from public.room_participants rp where rp.room_id = r.id),
    (now() > r.acceptance_deadline)
  from public.rooms r
  where r.invite_code = p_invite_code;
end;
$$;

-- 4. Check-in Solo Habit (Atomic Streak Continuity & Duplicate Prevention)
create or replace function public.check_in_solo_habit(
  p_habit_id uuid,
  p_check_in_date date,
  p_note text default null
) returns jsonb
language plpgsql
security definer set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_habit record;
  v_new_streak integer;
  v_longest_streak integer;
  v_day_diff integer;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_habit
  from public.habits
  where id = p_habit_id and user_id = v_user_id
  for update;

  if not found then
    raise exception 'Habit not found';
  end if;

  if v_habit.is_archived then
    raise exception 'Habit is archived';
  end if;

  if exists (select 1 from public.habit_logs where habit_id = p_habit_id and check_in_date = p_check_in_date) then
    raise exception 'Already checked in for this date';
  end if;

  if v_habit.last_completed_date is null then
    v_new_streak := 1;
  else
    v_day_diff := p_check_in_date - v_habit.last_completed_date;
    if v_day_diff = 1 then
      v_new_streak := v_habit.current_streak + 1;
    elsif v_day_diff = 0 then
      raise exception 'Already checked in on last completed date';
    else
      v_new_streak := 1;
    end if;
  end if;

  v_longest_streak := greatest(v_habit.longest_streak, v_new_streak);

  insert into public.habit_logs (habit_id, user_id, check_in_date, note, created_at)
  values (p_habit_id, v_user_id, p_check_in_date, p_note, now());

  update public.habits
  set current_streak = v_new_streak,
      longest_streak = v_longest_streak,
      last_completed_date = p_check_in_date,
      updated_at = now()
  where id = p_habit_id;

  return jsonb_build_object(
    'current_streak', v_new_streak,
    'longest_streak', v_longest_streak,
    'check_in_date', p_check_in_date
  );
end;
$$;

-- 5. Check-in Room Challenge (The SOLE write path for room check-ins: enforces 1 pt increment)
create or replace function public.check_in_room(
  p_room_id uuid,
  p_check_in_date date,
  p_note text default null
) returns jsonb
language plpgsql
security definer set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_room record;
  v_participant record;
  v_new_points integer;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_room
  from public.rooms
  where id = p_room_id;

  if not found then
    raise exception 'Room not found';
  end if;

  if p_check_in_date < v_room.start_date then
    raise exception 'Room challenge has not started yet';
  end if;

  if p_check_in_date > v_room.end_date or v_room.status = 'completed' then
    raise exception 'Room challenge has ended';
  end if;

  select * into v_participant
  from public.room_participants
  where room_id = p_room_id and user_id = v_user_id
  for update;

  if not found then
    raise exception 'You are not a participant in this room';
  end if;

  if exists (
    select 1 from public.room_logs
    where room_id = p_room_id and user_id = v_user_id and check_in_date = p_check_in_date
  ) then
    raise exception 'Already checked in for this date in this room';
  end if;

  insert into public.room_logs (room_id, user_id, check_in_date, note, created_at)
  values (p_room_id, v_user_id, p_check_in_date, p_note, now());

  v_new_points := v_participant.points + 1;
  update public.room_participants
  set points = v_new_points
  where id = v_participant.id;

  return jsonb_build_object(
    'points', v_new_points,
    'check_in_date', p_check_in_date
  );
end;
$$;

-- 6. Finalize Room Standings & Tiered Virtual Rewards (Atomic & Idempotent)
create or replace function public.finalize_room_standings(p_room_id uuid)
returns void
language plpgsql
security definer set search_path = public, pg_temp
as $$
declare
  v_room record;
  v_count integer;
  v_pool integer;
  v_rank integer := 1;
  v_p1_share integer := 0;
  v_p2_share integer := 0;
  v_p3_share integer := 0;
  v_rec record;
begin
  select * into v_room
  from public.rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'Room not found';
  end if;

  if v_room.status = 'completed' then
    return;
  end if;

  if current_date <= v_room.end_date then
    raise exception 'Room challenge has not concluded yet';
  end if;

  update public.rooms
  set status = 'completed'
  where id = p_room_id;

  select count(*) into v_count
  from public.room_participants
  where room_id = p_room_id;

  v_pool := v_room.points_pool;

  if v_pool > 0 and v_count > 0 then
    if v_count = 1 then
      v_p1_share := v_pool;
    elsif v_count = 2 then
      v_p1_share := (v_pool * 70) / 100;
      v_p2_share := v_pool - v_p1_share;
    else
      v_p1_share := (v_pool * 50) / 100;
      v_p2_share := (v_pool * 30) / 100;
      v_p3_share := v_pool - (v_p1_share + v_p2_share);
    end if;
  end if;

  for v_rec in (
    select id, user_id, points
    from public.room_participants
    where room_id = p_room_id
    order by points desc, joined_at asc
    for update
  ) loop
    declare
      v_payout integer := 0;
    begin
      if v_rank = 1 then
        v_payout := v_p1_share;
      elsif v_rank = 2 then
        v_payout := v_p2_share;
      elsif v_rank = 3 then
        v_payout := v_p3_share;
      else
        v_payout := 0;
      end if;

      update public.room_participants
      set final_rank = v_rank,
          payout_received = v_payout
      where id = v_rec.id;

      if v_payout > 0 then
        update public.profiles
        set virtual_points = virtual_points + v_payout,
            updated_at = now()
        where id = v_rec.user_id;
      end if;

      v_rank := v_rank + 1;
    end;
  end loop;
end;
$$;

-- Explicit Function Permissions
revoke all on function public.create_challenge_room from public;
grant execute on function public.create_challenge_room to authenticated;

revoke all on function public.join_challenge_room from public;
grant execute on function public.join_challenge_room to authenticated;

revoke all on function public.get_room_preview_by_invite from public;
grant execute on function public.get_room_preview_by_invite to authenticated;

revoke all on function public.check_in_solo_habit from public;
grant execute on function public.check_in_solo_habit to authenticated;

revoke all on function public.check_in_room from public;
grant execute on function public.check_in_room to authenticated;

revoke all on function public.finalize_room_standings from public;
grant execute on function public.finalize_room_standings to authenticated;

-- ==============================================================================
-- REALTIME PUBLICATION SETUP
-- ==============================================================================

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'room_participants'
  ) then
    alter publication supabase_realtime add table public.room_participants;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'room_logs'
  ) then
    alter publication supabase_realtime add table public.room_logs;
  end if;
end
$$;
