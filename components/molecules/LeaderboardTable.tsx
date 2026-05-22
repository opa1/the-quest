import LeaderboardRow from '@/components/atoms/LeaderboardRow'
import RankBadge from '@/components/atoms/RankBadge'
import UserAvatar from '@/components/atoms/UserAvatar'
import { Card } from '@/components/ui/card'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { cn } from '@/lib/utils'
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
    <>
      {/* Mobile — cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {entries.map((entry) => (
          <Card
            key={entry.id}
            className={cn(
              'rounded-[14px] p-4 flex flex-col gap-3 border',
              entry.isCurrentUser
                ? 'bg-primary/10 border-primary/20'
                : 'bg-card border-border/40'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RankBadge rank={entry.rank} />
                <UserAvatar src={entry.avatar_url} username={entry.username ?? 'Unknown'} size="sm" />
                <span className="text-sm font-semibold text-foreground">
                  @{entry.username ?? 'Unknown'}
                  {entry.isCurrentUser && (
                    <span className="ml-2 text-[10px] text-primary uppercase tracking-widest font-bold">YOU</span>
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border/30">
              <div className="flex flex-col gap-0.5 text-center">
                <span className="text-sm font-black text-primary tabular-nums">{entry.credits.toLocaleString()}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{tableHeaders.credits}</span>
              </div>
              <div className="flex flex-col gap-0.5 text-center">
                <span className="text-sm font-bold text-foreground tabular-nums">{entry.completed}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{tableHeaders.completed}</span>
              </div>
              <div className="flex flex-col gap-0.5 text-center">
                <span className="text-sm font-semibold text-primary tabular-nums">{entry.proofs}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{tableHeaders.proofs}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop — table */}
      <div className="hidden md:flex flex-col rounded-[16px] border border-border/40 overflow-hidden">
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
    </>
  )
}
