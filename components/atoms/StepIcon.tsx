import {
  type LucideIcon,
  ClipboardList,
  CheckSquare,
  Swords,
  Gem,
  BookOpen,
  Trophy,
  Users,
  Map,
  Flag,
  Compass,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, LucideIcon> = {
  ClipboardList,
  CheckSquare,
  Swords,
  Gem,
  BookOpen,
  Trophy,
  Users,
  Map,
  Flag,
  Compass,
  Award,
}

interface StepIconProps {
  iconName: string
  active?: boolean
  className?: string
}

export function StepIcon({ iconName, active, className }: StepIconProps) {
  const Icon = ICON_MAP[iconName]

  return (
    <div
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-[10px] border transition-all duration-500 ease-out aspect-square',
        active ? 'border-primary/40 bg-primary/15' : 'border-border/60 bg-muted',
        className
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            'h-5 w-5 transition-colors duration-500',
            active ? 'text-primary' : 'text-muted-foreground'
          )}
        />
      )}
    </div>
  )
}
