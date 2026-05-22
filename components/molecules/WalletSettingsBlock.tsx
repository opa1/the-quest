'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import WalletConnectBlock from '@/components/molecules/WalletConnectBlock'
import { updateWalletAddress, disconnectWallet } from '@/app/actions/profile'
import { truncateAddress } from '@/lib/utils/rank'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

interface WalletSettingsBlockProps {
  walletAddress: string | null
}

const { wallet: cfg } = QUEST_CONFIG.settings.sections

export default function WalletSettingsBlock({ walletAddress: initialWallet }: WalletSettingsBlockProps) {
  const [wallet, setWallet] = useState(initialWallet)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const handleWalletConnected = async (address: string) => {
    const result = await updateWalletAddress(address)
    if ('success' in result) setWallet(address)
  }

  const handleDisconnect = async () => {
    if (!window.confirm(cfg.disconnectConfirm)) return
    setIsDisconnecting(true)
    const result = await disconnectWallet()
    if ('success' in result) setWallet(null)
    setIsDisconnecting(false)
  }

  return (
    <Card className="bg-card border-border/50 rounded-[16px] p-6 flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-black uppercase tracking-widest text-foreground">{cfg.title}</h2>
        <p className="text-xs text-muted-foreground">{cfg.subtext}</p>
      </div>

      <Separator />

      {wallet ? (
        <div className="flex flex-col gap-3">
          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            {cfg.connectedLabel}
          </span>
          <div className="flex items-center justify-between gap-3 bg-muted/30 border border-border/40 rounded-[10px] px-4 py-3">
            <span className="text-xs font-mono text-foreground truncate">
              {truncateAddress(wallet)}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigator.clipboard.writeText(wallet)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Copy wallet address"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive text-xs uppercase tracking-widest font-bold px-2"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
              >
                {cfg.disconnectLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <WalletConnectBlock
          onConnected={handleWalletConnected}
          onSkip={() => {}}
          connectedAddress={null}
          showSkip={false}
        />
      )}

    </Card>
  )
}
