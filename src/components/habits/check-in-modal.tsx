'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatLocalDate } from '@/lib/streak'
import { CheckCircle2, AlertCircle, Loader2, X, FileText } from 'lucide-react'

interface CheckInModalProps {
  habitId: string
  habitTitle: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CheckInModal({
  habitId,
  habitTitle,
  isOpen,
  onClose,
  onSuccess,
}: CheckInModalProps) {
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const todayStr = formatLocalDate()

  if (!isOpen) return null

  async function handleCheckIn(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { error: rpcError } = await supabase.rpc('check_in_solo_habit', {
        p_habit_id: habitId,
        p_check_in_date: todayStr,
        p_note: note.trim() || null,
      })

      if (rpcError) {
        if (
          rpcError.message.includes('Already checked in') ||
          rpcError.code === '23505'
        ) {
          setError("You have already checked in for today's habit!")
        } else {
          setError(rpcError.message)
        }
        setIsSubmitting(false)
        return
      }

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Check-in error:', err)
      setError('Failed to submit check-in. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
              Daily Check-in
            </span>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {habitTitle}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Date: <span className="font-mono font-medium">{todayStr}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCheckIn} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="note"
                className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Optional Note</span>
              </label>
              <span className="text-[11px] text-zinc-400">
                {note.length} / 280
              </span>
            </div>
            <textarea
              id="note"
              rows={3}
              maxLength={280}
              disabled={isSubmitting}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Read 20 pages of chapter 4, felt focused."
              className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 disabled:opacity-50 resize-none"
            />
          </div>

          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-3 text-xs text-zinc-600 dark:text-zinc-400">
            Self-reporting this habit will mark today as completed (+1 point) and advance your consecutive streak.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Marking Done...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Confirm Done</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
