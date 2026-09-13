import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { RoomDetailView } from '@/components/rooms/room-detail-view'
import type { ParticipantItem } from '@/components/rooms/participant-roster'
import type { RoomLogItem } from '@/components/rooms/room-check-in-card'
import { ShieldAlert, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface RoomDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 2. Fetch Room (Protected by RLS: only creator and participants can select)
  const { data: room, error: roomErr } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (roomErr || !room) {
    return (
      <div className="min-h-screen bg-sand-50 dark:bg-brand-950 flex flex-col">
        <Navbar profile={profile} />

        <main className="flex-1 mx-auto w-full max-w-xl px-4 sm:px-6 py-12">
          <div className="rounded-2xl border border-sand-200 bg-white p-8 text-center shadow-sm dark:border-brand-800 dark:bg-brand-900 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-50 text-gold-600 mx-auto dark:bg-gold-950/60 dark:text-gold-400">
              <ShieldAlert className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                Challenge Not Found or Access Denied
              </h1>
              <p className="text-xs text-zinc-600 dark:text-sand-400">
                Habit Arena challenge rooms are strictly private and invite-only. You must be an accepted participant or the room creator to enter.
              </p>
            </div>

            <div className="pt-3">
              <Link
                href="/rooms"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gold-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-500 transition-colors"
              >
                <span>Back to Challenges</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // 3. Fetch Participants with profile details
  const { data: participantsData } = await supabase
    .from('room_participants')
    .select(`
      id,
      room_id,
      user_id,
      points,
      final_rank,
      payout_received,
      joined_at,
      profiles (
        username,
        display_name,
        virtual_points
      )
    `)
    .eq('room_id', id)
    .order('points', { ascending: false })
    .order('joined_at', { ascending: true })

  const rawParticipants = (participantsData || []) as unknown as Array<{
    id: string
    user_id: string
    points: number
    final_rank: number | null
    payout_received: number
    joined_at: string
    profiles: {
      username: string
      display_name: string
      virtual_points: number
    } | null
  }>

  const participants: ParticipantItem[] = rawParticipants.map((p) => ({
    id: p.id,
    user_id: p.user_id,
    points: p.points,
    final_rank: p.final_rank,
    payout_received: p.payout_received,
    joined_at: p.joined_at,
    profiles: p.profiles,
  }))

  // 4. Fetch Room Logs (Protected by RLS: only participants can view)
  const { data: logsData } = await supabase
    .from('room_logs')
    .select(`
      id,
      room_id,
      user_id,
      check_in_date,
      note,
      created_at,
      profiles (
        username,
        display_name
      )
    `)
    .eq('room_id', id)
    .order('created_at', { ascending: false })

  const rawLogs = (logsData || []) as unknown as Array<{
    id: string
    room_id: string
    user_id: string
    check_in_date: string
    note: string | null
    created_at: string
    profiles: {
      username: string
      display_name: string
    } | null
  }>

  const roomLogs: RoomLogItem[] = rawLogs.map((l) => ({
    id: l.id,
    room_id: l.room_id,
    user_id: l.user_id,
    check_in_date: l.check_in_date,
    note: l.note,
    created_at: l.created_at,
    profiles: l.profiles,
  }))

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-brand-950 flex flex-col">
      <Navbar profile={profile} />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-8">
        <RoomDetailView
          room={room}
          initialParticipants={participants}
          initialLogs={roomLogs}
          currentUserId={user.id}
          currentUserProfile={
            profile
              ? {
                  username: profile.username,
                  display_name: profile.display_name,
                }
              : null
          }
        />
      </main>
    </div>
  )
}
