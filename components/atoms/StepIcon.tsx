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
  className?: string
}

export function StepIcon({ iconName, className }: StepIconProps) {
  const Icon = ICON_MAP[iconName]

  return (
    <div
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-[10px] border border-border/60 bg-muted',
        className
      )}
    >
      {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
    </div>
  )
}
