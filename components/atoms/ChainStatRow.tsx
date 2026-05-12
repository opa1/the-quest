import { cn } from '@/lib/utils'

interface ChainStatRowProps {
  label: string
  value: string
  valueHighlight?: boolean
  className?: string
}

export function ChainStatRow({ label, value, valueHighlight, className }: ChainStatRowProps) {
  return (
    <div className={cn('flex flex-col md:flex-row md:items-center justify-between', className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          valueHighlight
            ? 'text-2xl font-black text-primary'
            : 'text-base font-bold text-foreground'
        )}
      >
        {value}
      </span>
    </div>
  )
}
