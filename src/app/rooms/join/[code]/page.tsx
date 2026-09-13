import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { JoinRoomCard } from '@/components/rooms/join-room-card'
import type { RoomPreview } from '@/types/database.types'
import { ArrowLeft, ShieldAlert, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface JoinPageProps {
  params: Promise<{ code: string }>
}

export default async function JoinRoomPage({ params }: JoinPageProps) {
  const { code } = await params
  const decodedCode = decodeURIComponent(code || '').trim()

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/rooms/join/${decodedCode}`)}`)
  }

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 2. Fetch Room Preview via SECURITY DEFINER RPC (Zero public room leak)
  const { data, error } = await supabase.rpc('get_room_preview_by_invite', {
    p_invite_code: decodedCode,
  })

  const previewList = (data as unknown as RoomPreview[]) || []
  const preview = previewList.length > 0 ? previewList[0] : null

  // 3. If invalid or not found, display safe error card
  if (error || !preview) {
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
                Invalid or Expired Invite
              </h1>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                The invite code <span className="font-mono font-semibold">{decodedCode}</span> does not match any active challenge room or has expired.
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

  // 4. Check if current user is already a member
  const { data: existingParticipant } = await supabase
    .from('room_participants')
    .select('id')
    .eq('room_id', preview.room_id)
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Navbar profile={profile} />

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 py-8 space-y-4">
        <div>
          <Link
            href="/rooms"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Challenges</span>
          </Link>
        </div>

        <JoinRoomCard
          preview={preview}
          inviteCode={decodedCode}
          isAlreadyJoined={!!existingParticipant}
        />
      </main>
    </div>
  )
}
