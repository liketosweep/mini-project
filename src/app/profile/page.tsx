import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { ProfileForm } from './profile-form'
import { User } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
        <Navbar profile={null} />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 max-w-md text-center">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Profile Initializing</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Your profile record is being configured. Please refresh in a moment.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Navbar profile={profile} />

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <User className="h-6 w-6 text-indigo-600" />
            <span>Account Profile</span>
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Manage your display name and public handle for Habit Arena.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <ProfileForm profile={profile} userEmail={user.email || ''} />
        </div>
      </main>
    </div>
  )
}
