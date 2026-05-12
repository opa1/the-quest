import { cn } from '@/lib/utils'

interface RepMintedProps {
  amount: number
  className?: string
}

export function RepMinted({ amount, className }: RepMintedProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        REPUTATION MINTED
      </span>
      <span className="text-lg font-black text-primary">+{amount} REP</span>
    </div>
  )
}
