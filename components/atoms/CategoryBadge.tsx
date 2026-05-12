import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
  label: string
  className?: string
}

export function CategoryBadge({ label, className }: CategoryBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'bg-muted text-muted-foreground border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest',
        className
      )}
    >
      {label}
    </Badge>
  )
}
