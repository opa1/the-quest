import { Card } from '@/components/ui/card'
import { StepIcon } from '@/components/atoms/StepIcon'
import { cn } from '@/lib/utils'

interface GuildStepCardProps {
  id: string
  number: string
  icon: string
  title: string
  description: string
  className?: string
}

export function GuildStepCard({
  icon,
  title,
  description,
  className,
}: GuildStepCardProps) {
  return (
    <Card
      className={cn(
        'flex h-full flex-col rounded-[16px] border border-border/50 bg-muted/40 p-8 transition-colors duration-200 hover:border-border',
        className
      )}
    >
      <StepIcon iconName={icon} />
      <h3 className="mt-5 text-xl font-bold leading-snug text-foreground">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </Card>
  )
}
