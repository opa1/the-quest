import { cn } from '@/lib/utils'

interface SectionTitleProps {
  title: string
  subtext?: string
  className?: string
}

export function SectionTitle({ title, subtext, className }: SectionTitleProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <h2 className="font-heading text-4xl font-black uppercase tracking-[0.15em] text-primary md:text-5xl text-center">
        {title}
      </h2>
      {subtext && (
        <p className="mx-auto mt-4 max-w-xl text-center text-base leading-relaxed text-muted-foreground">
          {subtext}
        </p>
      )}
    </div>
  )
}
