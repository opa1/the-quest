import { WalletMinimal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { cn } from '@/lib/utils'

interface WalletNoneStateProps {
  className?: string
}

export default function WalletNoneState({ className }: WalletNoneStateProps) {
  const { walletNoneDetected, walletNoneSubtext, walletGetLink, walletGetLabel } =
    QUEST_CONFIG.onboarding

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <WalletMinimal className="w-8 h-8 text-muted-foreground mx-auto" />
      <p className="text-sm font-semibold text-muted-foreground text-center">
        {walletNoneDetected}
      </p>
      <p className="text-xs text-muted-foreground/60 text-center">{walletNoneSubtext}</p>
      <Button variant="ghost" size="sm" asChild>
        <a href={walletGetLink} target="_blank" rel="noreferrer">
          {walletGetLabel}
        </a>
      </Button>
    </div>
  )
}
