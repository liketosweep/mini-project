import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { HabitDetailView } from '@/components/habits/habit-detail-view'

export const dynamic = 'force-dynamic'

interface HabitDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function HabitDetailPage({ params }: HabitDetailPageProps) {
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

  // 2. Fetch Habit (ensuring ownership)
  const { data: habit } = await supabase
    .from('habits')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!habit) {
    notFound()
  }

  // 3. Fetch check-in logs for this habit
  const { data: logs } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('habit_id', id)
    .eq('user_id', user.id)
    .order('check_in_date', { ascending: false })

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-brand-950 flex flex-col">
      <Navbar profile={profile} />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-8">
        <HabitDetailView habit={habit} initialLogs={logs || []} />
      </main>
    </div>
  )
}
