import { XPReward } from '@/components/atoms/XPReward'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { cn } from '@/lib/utils'

interface DifficultyRadioOptionProps {
  value: 'easy' | 'medium' | 'hard'
  isSelected: boolean
  onClick: () => void
  className?: string
}

export default function DifficultyRadioOption({ value, isSelected, onClick, className }: DifficultyRadioOptionProps) {
  const config = QUEST_CONFIG.postMission.difficultyCredits[value]

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? onClick() : undefined}
      className={cn(
        'flex items-center gap-4 rounded-[12px] border px-5 py-4 cursor-pointer transition-all duration-200',
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-border/50 hover:border-primary/30 bg-muted/40',
        className
      )}
    >
      {/* Custom radio circle */}
      <div
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200',
          isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
        )}
      >
        {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
      </div>

      {/* Label + description + XP */}
      <div className="flex flex-col gap-0.5 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">{config.label}</span>
          <XPReward xp={config.credits} />
        </div>
        <span className="text-xs text-muted-foreground">{config.description}</span>
      </div>
    </div>
  )
}
