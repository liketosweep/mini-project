'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addDays, format } from 'date-fns'
import { createRoomSchema, type CreateRoomInput } from '@/lib/validators/room'
import { createClient } from '@/lib/supabase/client'
import { generateInviteCode, formatInviteUrl } from '@/lib/invite'
import { formatLocalDate } from '@/lib/streak'
import {
  Trophy,
  Calendar,
  Clock,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Swords,
  Flame,
  Info,
} from 'lucide-react'

export function CreateRoomForm() {
  const router = useRouter()
  const supabase = createClient()

  const [formError, setFormError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [createdRoom, setCreatedRoom] = useState<{
    id: string
    name: string
    habitTitle: string
    inviteCode: string
    entryPoints: number
  } | null>(null)

  // Compute sensible default dates
  const today = new Date()
  const defaultStartDate = formatLocalDate(today)
  const defaultEndDate = format(addDays(today, 7), 'yyyy-MM-dd')
  const defaultDeadline = `${defaultStartDate}T23:59`

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateRoomInput>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: '',
      habit_title: '',
      description: '',
      entry_points: 0,
      start_date: defaultStartDate,
      end_date: defaultEndDate,
      acceptance_deadline: defaultDeadline,
    },
  })

  async function onSubmit(values: CreateRoomInput) {
    try {
      setFormError(null)

      // Generate unique invite code
      const inviteCode = generateInviteCode()

      // Format acceptance deadline to ISO string
      const deadlineIso = new Date(values.acceptance_deadline).toISOString()

      const { data: newRoomId, error } = await supabase.rpc('create_challenge_room', {
        p_name: values.name,
        p_description: values.description || null,
        p_habit_title: values.habit_title,
        p_invite_code: inviteCode,
        p_entry_points: values.entry_points,
        p_acceptance_deadline: deadlineIso,
        p_start_date: values.start_date,
        p_end_date: values.end_date,
      })

      if (error) {
        setFormError(error.message || 'Failed to create challenge room.')
        return
      }

      if (!newRoomId) {
        setFormError('Room creation succeeded but no room ID was returned.')
        return
      }

      setCreatedRoom({
        id: newRoomId,
        name: values.name,
        habitTitle: values.habit_title,
        inviteCode: inviteCode,
        entryPoints: values.entry_points,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setFormError(msg)
    }
  }

  function handleCopyInviteLink() {
    if (!createdRoom) return
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const inviteUrl = formatInviteUrl(createdRoom.inviteCode, origin)
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (createdRoom) {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const inviteUrl = formatInviteUrl(createdRoom.inviteCode, origin)

    return (
      <div className="rounded-2xl border border-sand-200 bg-white p-6 sm:p-8 shadow-sm dark:border-brand-800 dark:bg-brand-900 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Check className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Challenge Created
            </span>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              {createdRoom.name}
            </h2>
          </div>
        </div>

        {/* Private Invite Link Banner */}
        <div className="rounded-xl border border-brand-200 bg-brand-50/70 p-5 dark:border-brand-900/50 dark:bg-brand-950/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-900 dark:text-brand-300">
                Private Invite Link
              </span>
            </div>
            <span className="text-xs font-medium text-zinc-500 dark:text-sand-400">
              Invite-only (Zero public browsing)
            </span>
          </div>

          <p className="text-xs text-zinc-600 dark:text-sand-400">
            Share this link with your friends to join this private challenge.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 rounded-lg border border-sand-300 bg-white px-3 py-2 text-xs font-mono text-zinc-800 dark:border-brand-700 dark:bg-brand-800 dark:text-sand-200 truncate select-all">
              {inviteUrl}
            </div>
            <button
              type="button"
              onClick={handleCopyInviteLink}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gold-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-500 transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Invite Link</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs text-zinc-500 dark:text-sand-400">
            <span>Invite Code:</span>
            <span className="font-mono font-bold text-zinc-900 dark:text-white bg-white dark:bg-brand-800 px-2 py-0.5 rounded border border-sand-200 dark:border-brand-700">
              {createdRoom.inviteCode}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setCreatedRoom(null)
              reset()
            }}
            className="w-full sm:w-auto text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-sand-400 dark:hover:text-white py-2"
          >
            &larr; Create another challenge
          </button>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/rooms"
              className="flex-1 sm:flex-none text-center rounded-xl border border-sand-300 px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-sand-50 dark:border-brand-700 dark:text-sand-300 dark:hover:bg-brand-800 transition-colors"
            >
              Back to Challenges
            </Link>
            <button
              type="button"
              onClick={() => {
                router.push(`/rooms/${createdRoom.id}`)
                router.refresh()
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-gold-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-500 transition-colors"
            >
              <span>Enter Arena</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-sand-200 bg-white p-6 sm:p-8 shadow-sm dark:border-brand-800 dark:bg-brand-900 space-y-6"
    >
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
            <Swords className="h-4 w-4" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            New Challenge Room
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Create a Private Challenge
        </h1>
        <p className="text-xs text-zinc-600 dark:text-sand-400">
          Compete privately with friends on a shared daily habit. Strict invite-only access.
        </p>
      </div>

      {formError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Challenge Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="name"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-sand-300"
          >
            Challenge Name *
          </label>
          <input
            id="name"
            type="text"
            disabled={isSubmitting}
            placeholder="e.g. 7-Day Sprint: Clean Code Warriors"
            {...register('name')}
            className="w-full rounded-xl border border-sand-300 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-brand-700 dark:bg-brand-800 dark:text-white dark:placeholder:text-zinc-500 disabled:opacity-50"
          />
          {errors.name && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.name.message}</p>
          )}
        </div>

        {/* Shared Habit Goal Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="habit_title"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-sand-300"
            >
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span>Shared Daily Goal *</span>
            </label>
            <span className="text-[11px] text-zinc-500 dark:text-sand-400">
              1 check-in = 1 point
            </span>
          </div>
          <input
            id="habit_title"
            type="text"
            disabled={isSubmitting}
            placeholder="e.g. Solve 2 LeetCode problems daily, 30 min morning workout"
            {...register('habit_title')}
            className="w-full rounded-xl border border-sand-300 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-brand-700 dark:bg-brand-800 dark:text-white dark:placeholder:text-zinc-500 disabled:opacity-50"
          />
          {errors.habit_title && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.habit_title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label
            htmlFor="description"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-sand-300"
          >
            Description (Optional)
          </label>
          <textarea
            id="description"
            rows={2}
            disabled={isSubmitting}
            placeholder="Challenge rules, group expectations, or motivation..."
            {...register('description')}
            className="w-full rounded-xl border border-sand-300 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-brand-700 dark:bg-brand-800 dark:text-white dark:placeholder:text-zinc-500 disabled:opacity-50 resize-none"
          />
          {errors.description && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.description.message}</p>
          )}
        </div>

        {/* Entry Points */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="entry_points"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-sand-300"
            >
              <Trophy className="h-3.5 w-3.5 text-gold-600 dark:text-gold-400" />
              <span>Virtual Entry Stake</span>
            </label>
            <span className="text-[11px] text-gold-700 dark:text-gold-400 font-medium">
              Free virtual points
            </span>
          </div>
          <input
            id="entry_points"
            type="number"
            min={0}
            step={1}
            disabled={isSubmitting}
            placeholder="0"
            {...register('entry_points', { valueAsNumber: true })}
            className="w-full rounded-xl border border-sand-300 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-brand-700 dark:bg-brand-800 dark:text-white dark:placeholder:text-zinc-500 disabled:opacity-50"
          />
          <p className="text-[11px] text-zinc-500 dark:text-sand-400 flex items-center gap-1">
            <Info className="h-3 w-3 shrink-0" />
            <span>
              Virtual stake is purely for competitive motivation. No real balance is deducted.
            </span>
          </p>
          {errors.entry_points && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.entry_points.message}</p>
          )}
        </div>

        {/* Date Row: Start Date & End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Date */}
          <div className="space-y-1.5">
            <label
              htmlFor="start_date"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-sand-300"
            >
              <Calendar className="h-3.5 w-3.5 text-brand-600" />
              <span>Start Date *</span>
            </label>
            <input
              id="start_date"
              type="date"
              disabled={isSubmitting}
              {...register('start_date')}
              className="w-full rounded-xl border border-sand-300 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-brand-700 dark:bg-brand-800 dark:text-white disabled:opacity-50"
            />
            {errors.start_date && (
              <p className="text-xs text-red-600 dark:text-red-400">{errors.start_date.message}</p>
            )}
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label
              htmlFor="end_date"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-sand-300"
            >
              <Calendar className="h-3.5 w-3.5 text-brand-600" />
              <span>End Date *</span>
            </label>
            <input
              id="end_date"
              type="date"
              disabled={isSubmitting}
              {...register('end_date')}
              className="w-full rounded-xl border border-sand-300 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-brand-700 dark:bg-brand-800 dark:text-white disabled:opacity-50"
            />
            {errors.end_date && (
              <p className="text-xs text-red-600 dark:text-red-400">{errors.end_date.message}</p>
            )}
          </div>
        </div>

        {/* Acceptance / Join Deadline */}
        <div className="space-y-1.5">
          <label
            htmlFor="acceptance_deadline"
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-sand-300"
          >
            <Clock className="h-3.5 w-3.5 text-brand-600" />
            <span>Join Deadline (Acceptance Deadline) *</span>
          </label>
          <input
            id="acceptance_deadline"
            type="datetime-local"
            disabled={isSubmitting}
            {...register('acceptance_deadline')}
            className="w-full rounded-xl border border-sand-300 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-brand-700 dark:bg-brand-800 dark:text-white disabled:opacity-50"
          />
          <p className="text-[11px] text-zinc-500 dark:text-sand-400">
            No participants can accept or join the challenge after this time.
          </p>
          {errors.acceptance_deadline && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errors.acceptance_deadline.message}
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-sand-100 dark:border-brand-800">
        <Link
          href="/rooms"
          className="rounded-xl border border-sand-300 px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-sand-50 dark:border-brand-700 dark:text-sand-300 dark:hover:bg-brand-800 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gold-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          <Swords className="h-3.5 w-3.5" />
          <span>{isSubmitting ? 'Creating Room...' : 'Create Challenge Room'}</span>
        </button>
      </div>
    </form>
  )
}
