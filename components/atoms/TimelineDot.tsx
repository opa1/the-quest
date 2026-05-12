import { cn } from '@/lib/utils'

interface TimelineDotProps {
  className?: string
}

export function TimelineDot({ className }: TimelineDotProps) {
  return (
    <div
      className={cn(
        'h-3 w-3 shrink-0 rounded-full border-2 border-primary bg-background',
        className
      )}
    />
  )
}
