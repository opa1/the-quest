import { Flame, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

const iconMap = {
  Flame,
  Shield,
} as const

type OathDividerIcon = keyof typeof iconMap

interface OathDividerProps {
  icon: string
  className?: string
}

export function OathDivider({ icon, className }: OathDividerProps) {
  const Icon = iconMap[icon as OathDividerIcon] ?? Flame

  return (
    <div className={cn('flex w-full items-center gap-4', className)}>
      <div className="h-px flex-1 bg-border/40" />
      <Icon className="h-4 w-4 shrink-0 text-primary/60" />
      <div className="h-px flex-1 bg-border/40" />
    </div>
  )
}
