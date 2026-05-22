import UserAvatar from '@/components/atoms/UserAvatar'
import RankBadge from '@/components/atoms/RankBadge'
import { cn } from '@/lib/utils'

interface LeaderboardRowProps {
  rank: number
  username: string
  xp: number
  bounties: number
  avatar: string | null
  completed: number
  proofs: number
  isCurrentUser?: boolean
}

export default function LeaderboardRow({
  rank, username, xp, avatar, completed, proofs, isCurrentUser,
}: LeaderboardRowProps) {
  return (
    <div
      className={cn(
        'flex items-center py-4 px-6 transition-colors duration-150 rounded-[8px]',
        isCurrentUser
          ? 'bg-primary/10 border border-primary/20'
          : 'hover:bg-muted/30'
      )}
    >
      <span className="w-12 shrink-0">
        <RankBadge rank={rank} />
      </span>

      <div className="flex flex-1 items-center gap-3 min-w-0">
        <UserAvatar src={avatar} username={username} size="sm" />
        <span className="text-sm font-semibold text-foreground truncate">
          @{username}
          {isCurrentUser && (
            <span className="ml-2 text-[10px] text-primary uppercase tracking-widest font-bold">YOU</span>
          )}
        </span>
      </div>

      <span className="w-28 text-right text-sm font-bold text-primary tabular-nums">
        {xp.toLocaleString()}
      </span>

      <span className="w-24 text-right text-sm text-muted-foreground tabular-nums">
        {completed}
      </span>

      <span className="w-20 text-right text-sm text-primary font-semibold tabular-nums">
        {proofs}
      </span>
    </div>
  )
}
