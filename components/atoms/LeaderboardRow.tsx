import { PodiumAvatar } from '@/components/atoms/PodiumAvatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface LeaderboardRowProps {
  rank: number
  username: string
  xp: number
  bounties: number
  avatar: string | null
  className?: string
}

export function LeaderboardRow({
  rank,
  username,
  xp,
  bounties,
  avatar,
  className,
}: LeaderboardRowProps) {
  return (
    <>
      <div
        className={cn(
          'flex items-center rounded-[8px] px-6 py-4 transition-colors duration-150 hover:bg-muted/30',
          className
        )}
      >
        <span className="w-12 text-sm font-bold text-muted-foreground">
          {String(rank).padStart(2, '0')}
        </span>
        <div className="flex flex-1 items-center gap-3">
          <PodiumAvatar src={avatar} username={username} size="sm" />
          <span className="text-sm font-semibold text-foreground">{username}</span>
        </div>
        <span className="w-28 text-right text-sm font-bold text-primary">
          {xp.toLocaleString()}
        </span>
        <span className="w-20 text-right text-sm text-muted-foreground">{bounties}</span>
      </div>
      <Separator className="bg-border/30" />
    </>
  )
}
