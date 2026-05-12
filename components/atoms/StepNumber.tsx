import { cn } from '@/lib/utils'

interface StepNumberProps {
  number: string
  active?: boolean
  className?: string
}

export function StepNumber({ number, active, className }: StepNumberProps) {
  return (
    <div
      className={cn(
        'flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-500 ease-out',
        active
          ? 'border-primary bg-primary ring-4 ring-primary/20'
          : 'border-border bg-card',
        className
      )}
    >
      <span
        className={cn(
          'font-heading text-lg font-bold transition-colors duration-500',
          active ? 'text-primary-foreground' : 'text-muted-foreground'
        )}
      >
        {number}
      </span>
    </div>
  )
}
