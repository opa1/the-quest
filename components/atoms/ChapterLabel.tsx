import { cn } from "@/lib/utils"

interface ChapterLabelProps {
  label: string
  variant?: 'pill' | 'text'
  decorated?: boolean
  className?: string
}

export function ChapterLabel({
  label,
  variant = 'pill',
  decorated = false,
  className,
}: ChapterLabelProps) {
  const displayLabel = decorated ? `— ${label} —` : label

  if (variant === 'text') {
    return (
      <span
        className={cn(
          "text-xs font-semibold uppercase tracking-widest text-primary",
          decorated && "text-center",
          className
        )}
      >
        {displayLabel}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full bg-muted px-4 py-2 text-xs font-semibold tracking-widest text-primary uppercase",
        className
      )}
    >
      {displayLabel}
    </span>
  )
}
