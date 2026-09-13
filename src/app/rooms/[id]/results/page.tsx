import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { FinalResultsView } from '@/components/rooms/final-results-view'
import type { ParticipantItem } from '@/components/rooms/participant-roster'
import { formatLocalDate } from '@/lib/streak'
import { ShieldAlert, ArrowLeft, ArrowRight, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface ResultsPageProps {
  params: Promise<{ id: string }>
}

export default async function RoomResultsPage({ params }: ResultsPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Fetch Profile
  const { data: initialProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  let profile = initialProfile

  // 2. Fetch Room (Protected by RLS: only members can view)
  const { data: initialRoom, error: roomErr } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  let room = initialRoom

  if (roomErr || !room) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
        <Navbar profile={profile} />

        <main className="flex-1 mx-auto w-full max-w-xl px-4 sm:px-6 py-12">
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mx-auto dark:bg-amber-950/60 dark:text-amber-400">
              <ShieldAlert className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                Challenge Not Found or Access Denied
              </h1>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Final challenge results are strictly private to enrolled participants and the creator.
              </p>
            </div>

            <div className="pt-3">
              <Link
                href="/rooms"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
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

  const todayStr = formatLocalDate()

  // 3. If room ended but not yet finalized, trigger atomic idempotent finalization
  if (room.status !== 'completed' && room.status !== 'cancelled') {
    if (todayStr > room.end_date) {
      // Challenge concluded -> finalize standings and virtual payouts
      const { error: finalErr } = await supabase.rpc('finalize_room_standings', {
        p_room_id: id,
      })

      if (!finalErr) {
        // Re-fetch room and profile now that finalization has updated points
        const [{ data: updatedRoom }, { data: updatedProfile }] = await Promise.all([
          supabase.from('rooms').select('*').eq('id', id).single(),
          supabase.from('profiles').select('*').eq('id', user.id).single(),
        ])

        if (updatedRoom) {
          room = updatedRoom
        }
        if (updatedProfile) {
          profile = updatedProfile
        }
      }
    } else {
      // Challenge is still in progress (today <= end_date)
      return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
          <Navbar profile={profile} />

          <main className="flex-1 mx-auto w-full max-w-xl px-4 sm:px-6 py-12">
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mx-auto dark:bg-indigo-950/60 dark:text-indigo-400">
                <Clock className="h-6 w-6" />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Challenge In Progress
                </span>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Results Not Available Yet
                </h1>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                  <span className="font-semibold">{room.name}</span> is currently active and runs through{' '}
                  <span className="font-semibold">{room.end_date}</span>. Daily check-ins are still being recorded. Final standings and virtual payouts will unlock once the challenge has concluded.
                </p>
              </div>

              <div className="pt-3">
                <Link
                  href={`/rooms/${room.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Return to Active Arena</span>
                </Link>
              </div>
            </div>
          </main>
        </div>
      )
    }
  }

  // 4. Fetch Final Participants with updated final_rank and payout_received
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
    .order('final_rank', { ascending: true, nullsFirst: false })
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

  // 5. Total Check-ins Count
  const { count: totalCheckIns } = await supabase
    .from('room_logs')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', id)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Navbar profile={profile} />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-8">
        <FinalResultsView
          room={room}
          participants={participants}
          currentUserId={user.id}
          totalCheckIns={totalCheckIns || 0}
        />
      </main>
    </div>
  )
}
