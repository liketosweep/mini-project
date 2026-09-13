import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { RoomsView } from '@/components/rooms/rooms-view'

export const dynamic = 'force-dynamic'

export default async function RoomsPage() {
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

  // 2. Fetch Rooms (RLS automatically scopes to rooms created or joined by user)
  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .order('created_at', { ascending: false })

  const userRooms = rooms || []

  // 3. Fetch Participant Counts for these rooms
  const participantCounts: Record<string, number> = {}

  if (userRooms.length > 0) {
    const roomIds = userRooms.map((r) => r.id)
    const { data: participants } = await supabase
      .from('room_participants')
      .select('room_id')
      .in('room_id', roomIds)

    if (participants) {
      for (const p of participants) {
        participantCounts[p.room_id] = (participantCounts[p.room_id] || 0) + 1
      }
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Navbar profile={profile} />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
        <RoomsView
          rooms={userRooms}
          currentUserId={user.id}
          participantCounts={participantCounts}
        />
      </main>
    </div>
  )
}
