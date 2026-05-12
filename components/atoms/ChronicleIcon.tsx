import {
  type LucideIcon,
  Star,
  Zap,
  Handshake,
  Bell,
  Activity,
  Radio,
  Layers,
  GitMerge,
  Megaphone,
  Lightbulb,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, LucideIcon> = {
  Star,
  Zap,
  Handshake,
  Bell,
  Activity,
  Radio,
  Layers,
  GitMerge,
  Megaphone,
  Lightbulb,
}

interface ChronicleIconProps {
  iconName: string
  className?: string
}

export function ChronicleIcon({ iconName, className }: ChronicleIconProps) {
  const Icon = ICON_MAP[iconName]

  return (
    <div
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-primary/30 bg-primary/10 shadow-[0_0_8px_oklch(0.795_0.184_86.047/0.15)]',
        className
      )}
    >
      {Icon && <Icon className="h-5 w-5 text-primary" />}
    </div>
  )
}
