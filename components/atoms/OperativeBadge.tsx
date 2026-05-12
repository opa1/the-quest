import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface OperativeBadgeProps {
  label: string
  className?: string
}

export function OperativeBadge({ label, className }: OperativeBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('border-primary text-primary uppercase tracking-widest', className)}
    >
      {label}
    </Badge>
  )
}
