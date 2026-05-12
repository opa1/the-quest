import { cn } from '@/lib/utils'

interface RoleLabelProps {
  label: string
  color: string
  className?: string
}

export function RoleLabel({ label, color, className }: RoleLabelProps) {
  return (
    <span
      className={cn(
        'text-[11px] font-semibold uppercase tracking-widest',
        className
      )}
      style={{ color }}
    >
      {label}
    </span>
  )
}
