import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { HabitsView } from '@/components/habits/habits-view'

export const dynamic = 'force-dynamic'

export default async function HabitsPage() {
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

  // 2. Fetch all habits for this user
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // 3. Fetch log counts per habit for total points display
  const { data: logs } = await supabase
    .from('habit_logs')
    .select('habit_id')
    .eq('user_id', user.id)

  const logCounts: Record<string, number> = {}
  if (logs) {
    for (const log of logs) {
      logCounts[log.habit_id] = (logCounts[log.habit_id] || 0) + 1
    }
  }

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-brand-950 flex flex-col">
      <Navbar profile={profile} />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
        <HabitsView
          initialHabits={habits || []}
          logCounts={logCounts}
          userId={user.id}
        />
      </main>
    </div>
  )
}
