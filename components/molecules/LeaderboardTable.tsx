import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { LeaderboardRow } from '@/components/atoms/LeaderboardRow'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export function LeaderboardTable() {
  return (
    <Card className="overflow-hidden rounded-[16px] border border-border/50 bg-card">
      <div className="flex items-center px-6 py-3">
        <span className="w-12 text-[11px] uppercase tracking-widest text-muted-foreground">
          RANK
        </span>
        <span className="flex-1 text-[11px] uppercase tracking-widest text-muted-foreground">
          OPERATIVE
        </span>
        <span className="w-28 text-right text-[11px] uppercase tracking-widest text-muted-foreground">
          XP
        </span>
        <span className="w-20 text-right text-[11px] uppercase tracking-widest text-muted-foreground">
          BOUNTIES
        </span>
      </div>

      <Separator className="bg-border/50" />

      {QUEST_CONFIG.hallOfFame.leaderboard.map((entry) => (
        <LeaderboardRow key={entry.rank} {...entry} />
      ))}
    </Card>
  )
}
