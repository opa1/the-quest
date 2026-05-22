import LeaderboardRow from '@/components/atoms/LeaderboardRow'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import type { LeaderboardEntry } from '@/lib/types/missions'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

export default function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  const { tableHeaders } = QUEST_CONFIG.leaderboard

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16">
        <p className="text-lg font-bold text-foreground text-center">
          {QUEST_CONFIG.leaderboard.emptyState.title}
        </p>
        <p className="text-sm text-muted-foreground text-center">
          {QUEST_CONFIG.leaderboard.emptyState.subtext}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col rounded-[16px] border border-border/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-6 py-3 bg-muted/20 border-b border-border/40">
        <span className="w-12 shrink-0 text-[11px] uppercase tracking-widest text-muted-foreground">
          {tableHeaders.rank}
        </span>
        <span className="flex-1 text-[11px] uppercase tracking-widest text-muted-foreground">
          {tableHeaders.operative}
        </span>
        <span className="w-28 text-right text-[11px] uppercase tracking-widest text-muted-foreground">
          {tableHeaders.credits}
        </span>
        <span className="w-24 text-right text-[11px] uppercase tracking-widest text-muted-foreground">
          {tableHeaders.completed}
        </span>
        <span className="w-20 text-right text-[11px] uppercase tracking-widest text-muted-foreground">
          {tableHeaders.proofs}
        </span>
      </div>

      {/* Rows */}
      <div className="flex flex-col divide-y divide-border/20">
        {entries.map((entry) => (
          <LeaderboardRow
            key={entry.id}
            rank={entry.rank}
            username={entry.username ?? 'Unknown'}
            xp={entry.credits}
            bounties={entry.completed}
            avatar={entry.avatar_url}
            completed={entry.completed}
            proofs={entry.proofs}
            isCurrentUser={entry.isCurrentUser}
          />
        ))}
      </div>
    </div>
  )
}
