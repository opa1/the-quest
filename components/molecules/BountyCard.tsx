import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { CategoryBadge } from '@/components/atoms/CategoryBadge'
import { DifficultyBadge } from '@/components/atoms/DifficultyBadge'
import { XPReward } from '@/components/atoms/XPReward'
import { AdaReward } from '@/components/atoms/AdaReward'
import ProofTypeBadge from '@/components/atoms/ProofTypeBadge'
import { cn } from '@/lib/utils'

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

interface BountyCardProps {
  id: string
  category: string
  difficulty: Difficulty
  title: string
  description: string
  xp: number
  featured?: boolean
  className?: string
  currentUserId?: string
  createdBy?: string
  taskStatus?: string
  adaReward?: number
  proofType?: 'url' | 'text' | 'image' | 'any'
}

export function BountyCard({
  id,
  category,
  difficulty,
  title,
  description,
  xp,
  featured,
  className,
  currentUserId,
  createdBy,
  taskStatus,
  adaReward,
  proofType,
}: BountyCardProps) {
  const isReviewable = taskStatus === 'submitted' && currentUserId && currentUserId === createdBy

  return (
    <Card
      className={cn(
        'flex h-full flex-col gap-4 rounded-[16px] border border-border bg-card p-6 transition-colors duration-200 hover:border-primary/50',
        featured && 'border-primary shadow-[0_0_24px_oklch(0.795_0.184_86.047/0.2)]',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <CategoryBadge label={category} />
        <div className="flex items-center gap-2">
          {proofType && <ProofTypeBadge proofType={proofType} />}
          <DifficultyBadge difficulty={difficulty} />
        </div>
      </div>

      <h3 className="text-lg font-bold leading-snug text-foreground">{title}</h3>

      <p className="flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
        {description}
      </p>

      <Separator className="my-1 bg-border/50" />

      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <XPReward xp={xp} />
            {adaReward !== undefined && <AdaReward lovelace={adaReward} />}
          </div>
          <Button variant={featured ? 'default' : 'outline'} size="sm" asChild>
            <Link href={`/tasks/${id}`}>
              <span className="text-xs uppercase tracking-widest">ACCEPT</span>
            </Link>
          </Button>
        </div>

        {isReviewable && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="w-full border-primary/50 text-primary hover:text-primary hover:border-primary"
          >
            <Link href={`/tasks/${id}/review`} className="flex items-center justify-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs uppercase tracking-widest font-bold">REVIEW</span>
            </Link>
          </Button>
        )}
      </div>
    </Card>
  )
}
