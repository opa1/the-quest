import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import PodiumAvatar from '@/components/atoms/PodiumAvatar'
import { cn } from '@/lib/utils'

interface PodiumStandardProps {
  rank: number
  username: string
  badge: string
  xp: number
  bounties: number
  avatar: string | null
  className?: string
}

export default function PodiumStandard({ rank, username, badge, xp, bounties, avatar, className }: PodiumStandardProps) {
  return (
    <Card
      className={cn(
        'flex flex-col items-center gap-3 rounded-[16px] border-border/60 bg-card p-6',
        className
      )}
    >
      <PodiumAvatar src={avatar} username={username} rank={rank} size="sm" />

      <div className="flex flex-col items-center gap-0.5 text-center">
        <span className="text-sm font-bold text-foreground">@{username}</span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{badge}</span>
      </div>

      <Separator className="w-full" />

      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col gap-0.5 text-center">
          <span className="text-base font-black text-primary">{xp.toLocaleString()}</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Credits</span>
        </div>
        <div className="flex flex-col gap-0.5 text-center">
          <span className="text-base font-black text-foreground">{bounties}</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Missions</span>
        </div>
      </div>
    </Card>
  )
}
