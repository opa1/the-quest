import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import PodiumAvatar from '@/components/atoms/PodiumAvatar'
import { cn } from '@/lib/utils'

interface PodiumFeaturedProps {
  rank: number
  username: string
  badge: string
  xp: number
  bounties: number
  avatar: string | null
  className?: string
}

export default function PodiumFeatured({ rank, username, badge, xp, bounties, avatar, className }: PodiumFeaturedProps) {
  return (
    <Card
      className={cn(
        'flex flex-col items-center gap-4 rounded-[20px] border-primary/40 bg-card p-8 shadow-[0_0_32px_oklch(0.795_0.184_86.047/0.15)]',
        className
      )}
    >
      <PodiumAvatar src={avatar} username={username} rank={rank} size="md" />

      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-base font-black text-foreground">@{username}</span>
        <span className="text-[10px] uppercase tracking-widest text-primary font-bold">{badge}</span>
      </div>

      <Separator className="w-full" />

      <div className="flex w-full items-center justify-between text-center">
        <div className="flex flex-col gap-0.5">
          <span className="text-xl font-black text-primary">{xp.toLocaleString()}</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Credits</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xl font-black text-foreground">{bounties}</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Missions</span>
        </div>
      </div>
    </Card>
  )
}
