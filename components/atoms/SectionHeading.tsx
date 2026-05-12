import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  topLine: string
  bottomLine: string
  className?: string
}

export function SectionHeading({ topLine, bottomLine, className }: SectionHeadingProps) {
  return (
    <div className={cn('font-heading font-black uppercase leading-none', className)}>
      <div className="text-6xl text-foreground md:text-7xl lg:text-8xl">{topLine}</div>
      <div className="text-6xl text-primary md:text-7xl lg:text-8xl">{bottomLine}</div>
    </div>
  )
}
