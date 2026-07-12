'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { switchNetwork } from '@/app/actions/network'
import type { Network } from '@/lib/config/network'

interface NetworkSettingsBlockProps {
  activeNetwork: Network
}

export default function NetworkSettingsBlock({
  activeNetwork,
}: NetworkSettingsBlockProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const isMainnet = activeNetwork === 'Mainnet'
  const target: Network = isMainnet ? 'Preprod' : 'Mainnet'

  const handleSwitch = () => {
    const message =
      target === 'Mainnet'
        ? 'Switch to Mainnet? This network uses real ADA. You may need to sign in or migrate your account on the other side.'
        : 'Switch to Testnet? This network uses test ADA (tADA).'
    if (!window.confirm(message)) return

    startTransition(async () => {
      await switchNetwork(target)
      // Land on home: the target network has its own session, so the user may
      // need to authenticate or migrate there.
      router.push('/')
      router.refresh()
    })
  }

  return (
    <Card className="bg-card border-border/50 rounded-[16px] p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-black uppercase tracking-widest text-foreground">
          Network
        </h2>
        <p className="text-xs text-muted-foreground">
          Switch between Mainnet (real ADA) and Testnet (tADA).
        </p>
      </div>

      <Separator />

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            Active network
          </span>
          <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-foreground">
            <span
              className={`h-2 w-2 rounded-full ${isMainnet ? 'bg-primary' : 'bg-amber-400'}`}
            />
            {isMainnet ? 'Mainnet' : 'Testnet'}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSwitch}
          disabled={isPending}
          className="shrink-0"
        >
          <span className="uppercase tracking-widest text-xs font-bold">
            {isPending ? 'Switching…' : `Switch to ${isMainnet ? 'Testnet' : 'Mainnet'}`}
          </span>
        </Button>
      </div>
    </Card>
  )
}
