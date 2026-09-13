'use client'

import { Clock, MessageSquare, CheckCircle2 } from 'lucide-react'
import type { RoomLogItem } from './room-check-in-card'

interface RoomRecentLogsProps {
  logs: RoomLogItem[]
  currentUserId: string
}

export function RoomRecentLogs({ logs, currentUserId }: RoomRecentLogsProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Recent Arena Check-Ins
          </h2>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {logs.length} Total
          </span>
        </div>

        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Accountability Activity
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800 space-y-2">
          <CheckCircle2 className="h-6 w-6 text-zinc-400 mx-auto" />
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            No check-ins recorded yet.
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
            Be the first warrior to mark your goal done today!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {logs.slice(0, 10).map((log) => {
            const isMe = log.user_id === currentUserId
            const displayName = log.profiles?.display_name || 'Warrior'
            const username = log.profiles?.username || 'user'
            const timeFormatted = new Date(log.created_at).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })

            return (
              <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {displayName}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                      @{username}
                    </span>
                    {isMe && (
                      <span className="inline-flex text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded">
                        You
                      </span>
                    )}
                  </div>

                  {log.note && (
                    <div className="flex items-start gap-1.5 text-zinc-600 dark:text-zinc-300 italic">
                      <MessageSquare className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">&ldquo;{log.note}&rdquo;</span>
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    +1 pt
                  </span>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    {timeFormatted}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
