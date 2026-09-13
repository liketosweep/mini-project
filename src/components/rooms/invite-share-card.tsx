'use client'

import { useState } from 'react'
import { formatInviteUrl } from '@/lib/invite'
import {
  ShieldCheck,
  Copy,
  Check,
  KeyRound,
} from 'lucide-react'

interface InviteShareCardProps {
  inviteCode: string
  acceptanceDeadline: string
}

export function InviteShareCard({ inviteCode, acceptanceDeadline }: InviteShareCardProps) {
  const [copied, setCopied] = useState(false)
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const inviteUrl = formatInviteUrl(inviteCode, origin)

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const deadlineDate = new Date(acceptanceDeadline).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-950/30 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
            Private Invite Link
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            (Recruiting phase)
          </span>
        </div>

        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Closes {deadlineDate}
        </span>
      </div>

      <p className="text-xs text-zinc-600 dark:text-zinc-400">
        Habit Arena is strictly invite-only. Anyone with this link can preview and join your challenge.
      </p>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex-1 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-mono text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 truncate select-all">
          {inviteUrl}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors shrink-0"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 pt-0.5">
        <KeyRound className="h-3.5 w-3.5 text-zinc-500" />
        <span>Invite Code:</span>
        <span className="font-mono font-bold text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
          {inviteCode}
        </span>
      </div>
    </div>
  )
}
