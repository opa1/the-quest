import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { CategoryBadge } from '@/components/atoms/CategoryBadge'
import { DifficultyBadge } from '@/components/atoms/DifficultyBadge'
import { XPReward } from '@/components/atoms/XPReward'
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
}: BountyCardProps) {
  return (
    <Card
      className={cn(
        'flex h-full flex-col gap-4 rounded-[16px] border border-border bg-card p-6 transition-colors duration-200 hover:border-primary/50',
        featured && 'border-primary shadow-[0_0_24px_oklch(0.795_0.184_86.047/0.2)]',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <CategoryBadge label={category} />
        <DifficultyBadge difficulty={difficulty} />
      </div>

      <h3 className="text-lg font-bold leading-snug text-foreground">{title}</h3>

      <p className="flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
        {description}
      </p>

      <Separator className="my-1 bg-border/50" />

      <div className="flex items-end justify-between">
        <XPReward xp={xp} />
        <Button variant={featured ? 'default' : 'outline'} size="sm" asChild>
          <Link href={`/tasks/${id}`}>
            <span className="text-xs uppercase tracking-widest">ACCEPT</span>
          </Link>
        </Button>
      </div>
    </Card>
  )
}
