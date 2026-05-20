import { Button } from '@/components/ui/button'
import { CategoryBadge } from '@/components/atoms/CategoryBadge'
import { DifficultyBadge } from '@/components/atoms/DifficultyBadge'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

interface ActiveMissionBannerProps {
  task: {
    id: string
    title: string
    category: string
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  } | null
}

export default function ActiveMissionBanner({ task }: ActiveMissionBannerProps) {
  if (!task) return null

  const { activeMission } = QUEST_CONFIG.realm

  return (
    <div className="bg-primary/10 border border-primary/40 rounded-[14px] p-5 flex flex-col gap-4">
      <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">
        {activeMission.label}
      </span>
      <p className="text-base font-bold text-foreground leading-snug">{task.title}</p>
      <div className="flex items-center gap-2">
        <CategoryBadge label={task.category} />
        <DifficultyBadge difficulty={task.difficulty} />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="default" size="sm" className="flex-1" asChild>
          <a href={`/tasks/${task.id}/submit`}>
            <span className="uppercase tracking-widest text-xs font-bold">
              {activeMission.submitLabel}
            </span>
          </a>
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          <span className="uppercase tracking-widest text-xs font-bold">
            {activeMission.dropLabel}
          </span>
        </Button>
      </div>
    </div>
  )
}
