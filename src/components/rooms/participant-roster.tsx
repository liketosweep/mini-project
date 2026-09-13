import { Trophy, ShieldCheck, User } from 'lucide-react'

export interface ParticipantItem {
  id: string
  user_id: string
  points: number
  final_rank: number | null
  payout_received: number
  joined_at: string
  profiles: {
    username: string
    display_name: string
    virtual_points: number
  } | null
}

interface ParticipantRosterProps {
  participants: ParticipantItem[]
  creatorId: string
  currentUserId: string
}

export function ParticipantRoster({
  participants,
  creatorId,
  currentUserId,
}: ParticipantRosterProps) {
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm dark:border-brand-800 dark:bg-brand-900 space-y-4">
      <div className="flex items-center justify-between border-b border-sand-100 dark:border-brand-800 pb-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Warriors Roster
          </h2>
          <span className="rounded-full bg-sand-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-brand-800 dark:text-sand-300">
            {participants.length}
          </span>
        </div>

        <span className="text-xs text-zinc-500 dark:text-sand-400">
          1 check-in = 1 point
        </span>
      </div>

      <div className="divide-y divide-sand-100 dark:divide-brand-800">
        {participants.map((p, index) => {
          const isCreator = p.user_id === creatorId
          const isMe = p.user_id === currentUserId
          const displayName = p.profiles?.display_name || 'Anonymous Warrior'
          const username = p.profiles?.username || 'user'
          const joinedFormatted = new Date(p.joined_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })

          return (
            <div
              key={p.id}
              className={`py-3.5 flex items-center justify-between gap-3 ${
                isMe ? 'bg-brand-50/40 dark:bg-brand-950/20 -mx-3 px-3 rounded-xl' : ''
              }`}
            >
              {/* Left: Rank / Avatar & Name */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-bold text-zinc-400 dark:text-sand-500 w-5 text-center shrink-0">
                  #{index + 1}
                </span>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sand-100 text-xs font-bold text-zinc-700 dark:bg-brand-800 dark:text-sand-300 shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                      {displayName}
                    </span>
                    {isCreator && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-brand-700 bg-brand-100 dark:bg-brand-950 dark:text-brand-300 px-1.5 py-0.2 rounded">
                        <ShieldCheck className="h-3 w-3" /> Host
                      </span>
                    )}
                    {isMe && (
                      <span className="inline-flex text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-sand-400 truncate">
                    @{username} &bull; Joined {joinedFormatted}
                  </p>
                </div>
              </div>

              {/* Right: Points */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 rounded-lg bg-sand-100 px-3 py-1.5 text-xs font-bold text-zinc-900 dark:bg-brand-800 dark:text-white">
                  <Trophy className="h-3.5 w-3.5 text-gold-500" />
                  <span>{p.points} {p.points === 1 ? 'pt' : 'pts'}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
