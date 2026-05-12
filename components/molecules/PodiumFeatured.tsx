import { Card } from '@/components/ui/card'
import { PodiumAvatar } from '@/components/atoms/PodiumAvatar'
import { RankBadge } from '@/components/atoms/RankBadge'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { cn } from '@/lib/utils'

interface PodiumFeaturedProps {
  rank: number
  username: string
  badge: 'LEGEND' | 'ELITE' | 'VETERAN'
  xp: number
  bounties: number
  avatar: string | null
  className?: string
}

export function PodiumFeatured({
  rank,
  username,
  badge,
  avatar,
  className,
}: PodiumFeaturedProps) {
  const borderClasses = QUEST_CONFIG.hallOfFame.podiumBorderConfig[1]

  return (
    <Card
      className={cn(
        'flex flex-col items-center gap-3 rounded-[16px] border bg-card p-8',
        borderClasses,
        className
      )}
    >
      <PodiumAvatar src={avatar} username={username} size="lg" ringClass="border-primary" />
      <RankBadge tier={badge} />
      <span className="text-xl font-black text-foreground">{username}</span>
      <span className="text-xs font-semibold uppercase tracking-widest text-primary">
        RANK {String(rank).padStart(2, '0')}
      </span>
    </Card>
  )
}
