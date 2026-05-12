import { cn } from '@/lib/utils'

interface ClassAccentBarProps {
  colorClass: string
  className?: string
}

export function ClassAccentBar({ colorClass, className }: ClassAccentBarProps) {
  return (
    <div className={cn('h-1 w-full rounded-t-[16px]', colorClass, className)} />
  )
}
