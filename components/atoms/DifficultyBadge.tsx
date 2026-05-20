import { Badge } from '@/components/ui/badge'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { cn } from '@/lib/utils'

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

interface DifficultyBadgeProps {
  difficulty: Difficulty
  className?: string
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const normalized = difficulty?.toUpperCase() as Difficulty
  const config = QUEST_CONFIG.difficultyConfig[normalized]

  if (!config) return null

  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={cn(
        'px-3 py-1 text-[11px] font-semibold uppercase tracking-widest',
        config.className,
        className
      )}
    >
      <span className="mr-1">
        <Icon size={14} />
      </span>
      {config.label}
    </Badge>
  )
}
