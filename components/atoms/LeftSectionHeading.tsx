import { ChapterLabel } from '@/components/atoms/ChapterLabel'
import { cn } from '@/lib/utils'

interface LeftSectionHeadingProps {
  chapterLabel?: string
  title: string
  subtext?: string
  className?: string
}

export function LeftSectionHeading({
  chapterLabel,
  title,
  subtext,
  className,
}: LeftSectionHeadingProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {chapterLabel && (
        <ChapterLabel label={chapterLabel} />
      )}
      <h2 className="mt-3 font-heading text-5xl font-black uppercase leading-none text-foreground md:text-6xl">
        {title}
      </h2>
      {subtext && (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {subtext}
        </p>
      )}
    </div>
  )
}
