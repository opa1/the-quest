import { Card } from '@/components/ui/card'
import { FeatureIcon } from '@/components/atoms/FeatureIcon'
import { TextLink } from '@/components/atoms/TextLink'
import { cn } from '@/lib/utils'

interface FeatureCardProps {
  id: string
  icon: string
  title: string
  description: string
  /** Required: should name the destination, not repeat a generic verb. */
  ctaLabel: string
  /** Required: a feature card without a destination is a dead end. */
  href: string
  className?: string
}

export function FeatureCard({
  icon,
  title,
  description,
  ctaLabel,
  href,
  className,
}: FeatureCardProps) {
  return (
    <Card
      className={cn(
        'flex h-full flex-col gap-0 rounded-[16px] border border-border/50 bg-muted/40 p-8 transition-colors duration-200 hover:border-primary/30',
        className
      )}
    >
      <FeatureIcon iconName={icon} />

      <h3 className="mt-6 text-xl font-bold leading-snug text-foreground">{title}</h3>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      <TextLink label={ctaLabel} href={href} className="mt-6" />
    </Card>
  )
}
