import { Card } from '@/components/ui/card'
import { ChronicleIcon } from '@/components/atoms/ChronicleIcon'
import { CategoryBadge } from '@/components/atoms/CategoryBadge'
import { cn } from '@/lib/utils'

interface ChronicleCardProps {
  id: string
  icon: string
  category: string
  title: string
  description: string
  className?: string
}

export function ChronicleCard({
  icon,
  category,
  title,
  description,
  className,
}: ChronicleCardProps) {
  return (
    <Card
      className={cn(
        'flex max-w-[420px] flex-col gap-0 rounded-[16px] border border-border/50 bg-muted/40 p-6 transition-colors duration-200 hover:border-primary/20',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <ChronicleIcon iconName={icon} />
        <CategoryBadge label={category} />
      </div>
      <h3 className="mt-3 text-xl font-bold leading-snug text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </Card>
  )
}
