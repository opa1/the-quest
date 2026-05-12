import { Card } from '@/components/ui/card'
import { StepIcon } from '@/components/atoms/StepIcon'
import { cn } from '@/lib/utils'

interface GuildStepCardProps {
  id: string
  number: string
  icon: string
  title: string
  description: string
  active?: boolean
  className?: string
}

export function GuildStepCard({
  icon,
  title,
  description,
  active,
  className,
}: GuildStepCardProps) {
  return (
    <Card
      className={cn(
        'flex h-full flex-col rounded-[16px] p-8 transition-all duration-500 border ease-out',
        active
          ? '-translate-y-1 border-primary bg-primary/[0.07]'
          : 'border-border/50 bg-muted/40',
        className
      )}
    >
      <StepIcon iconName={icon} active={active} />
      <h3
        className="mt-5 font-heading text-xl font-bold leading-snug text-foreground"
      >
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </Card>
  )
}
