import { SearchX } from 'lucide-react'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { cn } from '@/lib/utils'

interface MissionsEmptyStateProps {
  className?: string
}

export default function MissionsEmptyState({ className }: MissionsEmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-4 py-24', className)}>
      <SearchX className="w-10 h-10 text-muted-foreground mx-auto" />
      <p className="text-lg font-bold text-foreground text-center">
        {QUEST_CONFIG.missions.emptyState.title}
      </p>
      <p className="text-sm text-muted-foreground text-center">
        {QUEST_CONFIG.missions.emptyState.subtext}
      </p>
    </div>
  )
}
