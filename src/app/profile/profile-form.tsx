'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileUpdateSchema, type ProfileUpdateInput } from '@/lib/validators/auth'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database.types'
import { Trophy, AlertCircle, CheckCircle2, Loader2, Lock } from 'lucide-react'

interface ProfileFormProps {
  profile: Profile
  userEmail: string
}

export function ProfileForm({ profile, userEmail }: ProfileFormProps) {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      display_name: profile.display_name,
      username: profile.username,
    },
  })

  async function onSubmit(values: ProfileUpdateInput) {
    setFormError(null)
    setFormSuccess(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: values.display_name,
          username: values.username.toLowerCase(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) {
        if (error.code === '23505') {
          setFormError('This username is already taken. Please choose another.')
        } else {
          setFormError(error.message)
        }
        return
      }

      setFormSuccess('Profile updated successfully!')
      router.refresh()
    } catch (err) {
      console.error('Profile update error:', err)
      setFormError('Failed to update profile. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {formError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {formSuccess && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* Read-Only Account Email */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          <span>Account Email</span>
          <Lock className="h-3 w-3 text-zinc-400" />
        </label>
        <input
          type="email"
          value={userEmail}
          readOnly
          disabled
          className="w-full rounded-lg border border-zinc-200 bg-zinc-100 px-3.5 py-2.5 text-sm text-zinc-500 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-400"
        />
        <p className="text-[11px] text-zinc-500">Email is managed via your Supabase authentication account.</p>
      </div>

      {/* Read-Only Virtual Points */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          <span>Virtual Reward Points</span>
          <Lock className="h-3 w-3 text-zinc-400" />
        </label>
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/50 px-3.5 py-2.5 text-sm dark:border-amber-900/40 dark:bg-amber-950/20">
          <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="font-bold text-amber-900 dark:text-amber-200">
            {profile.virtual_points} points
          </span>
          <span className="text-xs text-amber-700/80 dark:text-amber-400/70 ml-auto">
            (Read-only • Earned via challenge room wins)
          </span>
        </div>
        <p className="text-[11px] text-zinc-500">
          Virtual points are free tokens awarded to top performers in rooms. Not editable by users.
        </p>
      </div>

      {/* Editable Display Name */}
      <div className="space-y-1.5">
        <label
          htmlFor="display_name"
          className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
        >
          Display Name
        </label>
        <input
          id="display_name"
          type="text"
          disabled={isSubmitting}
          {...register('display_name')}
          className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 disabled:opacity-50"
        />
        {errors.display_name && (
          <p className="text-xs text-red-600 dark:text-red-400">{errors.display_name.message}</p>
        )}
      </div>

      {/* Editable Username */}
      <div className="space-y-1.5">
        <label
          htmlFor="username"
          className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
        >
          Username
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-2.5 text-sm text-zinc-400">@</span>
          <input
            id="username"
            type="text"
            disabled={isSubmitting}
            {...register('username')}
            className="w-full rounded-lg border border-zinc-300 pl-8 pr-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 disabled:opacity-50"
          />
        </div>
        {errors.username && (
          <p className="text-xs text-red-600 dark:text-red-400">{errors.username.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 py-2.5 px-5 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <span>Save Profile</span>
          )}
        </button>
      </div>
    </form>
  )
}
