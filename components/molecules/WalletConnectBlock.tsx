'use client'

import dynamic from 'next/dynamic'
import { WalletMinimal, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { cn } from '@/lib/utils'

const WalletSelector = dynamic(
  () => import('@/components/molecules/WalletSelector'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    ),
  }
)

interface WalletConnectBlockProps {
  onConnected: (address: string) => void
  onSkip: () => void
  connectedAddress: string | null
  className?: string
}

function truncateAddress(addr: string) {
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`
}

export default function WalletConnectBlock({
  onConnected,
  onSkip,
  connectedAddress,
  className,
}: WalletConnectBlockProps) {
  const { walletTitle, walletSubtext, walletSkip } = QUEST_CONFIG.onboarding

  return (
    <div
      className={cn(
        'bg-muted/20 border border-border/50 rounded-[14px] p-6 flex flex-col gap-4',
        className
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <WalletMinimal className="w-4 h-4 text-primary" />
          <span className="text-xs uppercase tracking-widest font-semibold text-primary">
            {walletTitle}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{walletSubtext}</p>
      </div>

      {connectedAddress ? (
        <div className="flex items-center gap-3 bg-muted/40 border border-border/50 rounded-[10px] px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-foreground">Wallet linked</span>
            <span className="text-[11px] text-muted-foreground font-mono">
              {truncateAddress(connectedAddress)}
            </span>
          </div>
        </div>
      ) : (
        <WalletSelector onConnected={onConnected} />
      )}

      <Separator />

      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          {walletSkip}
        </Button>
      </div>
    </div>
  )
}
