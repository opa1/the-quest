'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Wallet } from 'lucide-react'
import XIcon from '@/components/atoms/XIcon'
import { useAuthStore } from '@/lib/stores/auth.store'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const WalletAuthFlow = dynamic(
  () => import('@/components/molecules/WalletAuthFlow'),
  { ssr: false }
)

type AuthMode = 'choose' | 'wallet'

export default function AuthDialog() {
  const { isDialogOpen, closeDialog, signInWithX } = useAuthStore()
  const { dialog } = QUEST_CONFIG.auth
  const [authMode, setAuthMode] = useState<AuthMode>('choose')
  const router = useRouter()

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeDialog()
      setAuthMode('choose')
    }
  }

  const handleWalletSuccess = (redirectTo: string) => {
    closeDialog()
    setAuthMode('choose')
    router.push(redirectTo)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border/50 rounded-[16px] max-w-md p-8">
        {authMode === 'wallet' ? (
          <WalletAuthFlow
            onSuccess={handleWalletSuccess}
            onBack={() => setAuthMode('choose')}
          />
        ) : (
          <>
            <DialogHeader className="space-y-3">
              <div className="flex justify-center mb-2">
                <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold font-heading">
                  THE QUEST
                </span>
              </div>

              <DialogTitle className="text-4xl font-black uppercase tracking-widest text-foreground text-center font-heading">
                {dialog.title}
              </DialogTitle>

              <DialogDescription className="text-sm text-muted-foreground text-center leading-relaxed">
                {dialog.subtext}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 mt-6 items-center">
              <div className="flex flex-col gap-2 w-fit">
                <Button variant="default" size="lg" onClick={signInWithX}>
                  <XIcon className="w-4 h-4 mr-2" />
                  <span className="uppercase tracking-widest text-sm font-bold">
                    {dialog.xButton}
                  </span>
                </Button>
                <p className="text-[11px] text-muted-foreground text-center">
                  {dialog.xSubtext}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full max-w-55">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-[11px] text-muted-foreground uppercase tracking-widest">
                  {dialog.orDivider}
                </span>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              <Button
                variant="outline"
                size="lg"
                // className="w-full min-w-55"
                onClick={() => setAuthMode('wallet')}
              >
                <Wallet className="w-4 h-4 mr-2" />
                <span className="uppercase tracking-widest text-sm font-bold">
                  {dialog.walletButton}
                </span>
              </Button>
            </div>

            <Separator className="my-4" />

            <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
              {dialog.terms}
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
