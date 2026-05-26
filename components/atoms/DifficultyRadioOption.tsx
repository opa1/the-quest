import { CheckCircle2 } from "lucide-react"
import { QUEST_CONFIG } from "@/lib/config/quest.config"
import { cn } from "@/lib/utils"

interface DifficultyRadioOptionProps {
  value: "easy" | "medium" | "hard"
  isSelected: boolean
  onClick: () => void
  className?: string
}

export default function DifficultyRadioOption({
  value,
  isSelected,
  onClick,
  className,
}: DifficultyRadioOptionProps) {
  const config = QUEST_CONFIG.postMission.difficultyCredits[value]
  const diffConfig =
    QUEST_CONFIG.difficultyConfig[
      value.toUpperCase() as "EASY" | "MEDIUM" | "HARD"
    ]
  const Icon = diffConfig.icon

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) =>
        e.key === "Enter" || e.key === " " ? onClick() : undefined
      }
      className={cn(
        "relative flex cursor-pointer flex-col items-center gap-2 rounded-[12px] border p-4 text-center transition-all duration-200",
        isSelected
          ? "border-primary bg-primary/10"
          : "border-border/50 bg-muted/40 hover:border-primary/30",
        className
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <CheckCircle2 className="absolute top-2 left-2 h-4 w-4 text-primary" />
      )}

      {/* Difficulty icon */}
      <Icon
        className={cn(
          "h-5 w-5",
          isSelected ? "text-primary" : "text-muted-foreground"
        )}
      />

      {/* Label */}
      <span className="text-sm leading-none font-bold text-foreground">
        {config.label}
      </span>

      {/* Description */}
      <span className="text-[11px] leading-snug text-muted-foreground">
        {config.description}
      </span>
    </div>
  )
}
