import { cn } from '@/lib/utils'

interface StepNumberProps {
  number: string
  className?: string
}

export function StepNumber({ number, className }: StepNumberProps) {
  return (
    <div
      className={cn(
        'flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card',
        className
      )}
    >
      <span className="font-heading text-lg font-bold text-muted-foreground">
        {number}
      </span>
    </div>
  )
}
