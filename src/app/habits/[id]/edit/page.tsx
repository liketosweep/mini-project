import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { EditHabitForm } from './edit-form'

export const dynamic = 'force-dynamic'

interface EditHabitPageProps {
  params: Promise<{ id: string }>
}

export default async function EditHabitPage({ params }: EditHabitPageProps) {
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

  // 2. Fetch Habit (verifying ownership)
  const { data: habit } = await supabase
    .from('habits')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!habit) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-brand-950 flex flex-col">
      <Navbar profile={profile} />

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 py-8">
        <EditHabitForm habit={habit} />
      </main>
    </div>
  )
}
