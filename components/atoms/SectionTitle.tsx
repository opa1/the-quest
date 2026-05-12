import { cn } from '@/lib/utils'

interface SectionTitleProps {
  title: string
  subtext: string
  className?: string
}

export function SectionTitle({ title, subtext, className }: SectionTitleProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <h2 className="font-heading text-5xl font-black uppercase text-foreground md:text-6xl lg:text-7xl">
        {title}
      </h2>
      <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
        {subtext}
      </p>
    </div>
  )
}
