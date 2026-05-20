import { Coins } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreditsDisplayProps {
  amount: number
  className?: string
}

export default function CreditsDisplay({ amount, className }: CreditsDisplayProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 bg-muted/40 border border-border/40 rounded-full px-4 py-2',
        className
      )}
    >
      <Coins className="w-4 h-4 text-primary" />
      <span className="text-sm font-bold text-primary">{amount.toLocaleString()}</span>
    </div>
  )
}
