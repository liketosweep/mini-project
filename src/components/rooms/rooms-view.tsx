'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Room } from '@/types/database.types'
import { RoomCard } from './room-card'
import {
  Swords,
  Plus,
  KeyRound,
  ArrowRight,
  Search,
} from 'lucide-react'

interface RoomsViewProps {
  rooms: Room[]
  currentUserId: string
  participantCounts: Record<string, number>
}

export function RoomsView({ rooms, currentUserId, participantCounts }: RoomsViewProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'recruiting' | 'active' | 'completed'>('all')
  const [inviteCodeInput, setInviteCodeInput] = useState('')
  const [inviteError, setInviteError] = useState<string | null>(null)

  function handleQuickJoin(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = inviteCodeInput.trim().toUpperCase()
    if (!trimmed) {
      setInviteError('Please enter an invite code.')
      return
    }
    setInviteError(null)
    router.push(`/rooms/join/${encodeURIComponent(trimmed)}`)
  }

  const filteredRooms = rooms.filter((r) => {
    if (filter === 'all') return true
    return r.status === filter
  })

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Swords className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Multiplayer Arenas
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Challenge Rooms
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Private, invite-only social competitions. Maximum 1 check-in per day = 1 point.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/rooms/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Challenge</span>
          </Link>
        </div>
      </div>

      {/* Quick Join Bar & Status Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/80 text-xs font-medium">
          {(['all', 'recruiting', 'active', 'completed'] as const).map((tab) => {
            const count =
              tab === 'all'
                ? rooms.length
                : rooms.filter((r) => r.status === tab).length
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`rounded-lg px-3 py-1.5 transition-colors capitalize whitespace-nowrap flex items-center gap-1.5 ${
                  filter === tab
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white font-bold'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <span>{tab}</span>
                <span className="rounded-full bg-zinc-200/70 dark:bg-zinc-700/60 px-1.5 py-0.2 text-[10px]">
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Quick Join by Invite Code */}
        <form onSubmit={handleQuickJoin} className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Paste invite code (e.g. HA-X8K2)"
              value={inviteCodeInput}
              onChange={(e) => {
                setInviteCodeInput(e.target.value)
                if (inviteError) setInviteError(null)
              }}
              className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white font-mono"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors shrink-0"
          >
            <span>Join</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </form>
      </div>

      {inviteError && (
        <p className="text-xs text-red-600 dark:text-red-400">{inviteError}</p>
      )}

      {/* Grid of Rooms */}
      {rooms.length === 0 ? (
        /* Zero Rooms State */
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mx-auto dark:bg-indigo-950/60 dark:text-indigo-400">
            <Swords className="h-6 w-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              No Challenge Rooms Yet
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Habit Arena challenge rooms are strictly private and invite-only. Create your own challenge to invite friends, or enter an invite code to join one.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/rooms/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Challenge</span>
            </Link>
          </div>
        </div>
      ) : filteredRooms.length === 0 ? (
        /* Filter Empty State */
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
          <Search className="h-6 w-6 text-zinc-400 mx-auto" />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            No challenge rooms found in status &ldquo;{filter}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              currentUserId={currentUserId}
              participantCount={participantCounts[room.id] ?? 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
