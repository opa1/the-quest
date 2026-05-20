import { Loader2, WalletMinimal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { cn } from '@/lib/utils'

interface WalletOptionProps {
  name: string
  icon?: string | null
  onConnect: () => void
  isConnecting: boolean
  className?: string
}

export default function WalletOption({
  name,
  icon,
  onConnect,
  isConnecting,
  className,
}: WalletOptionProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between',
        'bg-muted/40 border border-border/50 rounded-[12px] px-4 py-3',
        'hover:border-primary/40 transition-colors duration-150',
        className
      )}
    >
      <div className="flex items-center">
        {icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={icon} alt={name} className="w-8 h-8 rounded-[8px]" />
        ) : (
          <div className="w-8 h-8 rounded-[8px] bg-muted flex items-center justify-center">
            <WalletMinimal className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        <span className="text-sm font-semibold text-foreground ml-3">{name}</span>
      </div>

      <Button variant="outline" size="sm" onClick={onConnect} disabled={isConnecting}>
        {isConnecting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          QUEST_CONFIG.onboarding.walletConnect
        )}
      </Button>
    </div>
  )
}
