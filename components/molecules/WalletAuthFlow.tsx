'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Loader2, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCardano } from '@cardano-foundation/cardano-connect-with-wallet'
import { NetworkType } from '@cardano-foundation/cardano-connect-with-wallet-core'
import { walletSignIn } from '@/app/actions/auth'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { activeNetworkFromCookie } from '@/lib/config/network'

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

type AuthStep = 'connecting' | 'signing' | 'verifying' | 'error'

interface WalletAuthFlowProps {
  onSuccess: (redirectTo: string) => void
  onBack: () => void
}

export default function WalletAuthFlow({ onSuccess, onBack }: WalletAuthFlowProps) {
  const walletNetwork =
    activeNetworkFromCookie() === 'Mainnet' ? NetworkType.MAINNET : NetworkType.TESTNET
  const { isConnected, usedAddresses, signMessage, disconnect } = useCardano({
    limitNetwork: walletNetwork,
  })
  const [step, setStep] = useState<AuthStep>('connecting')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const signingRef = useRef(false)
  const cfg = QUEST_CONFIG.walletAuth

  const startSigningFlow = useCallback(
    async (walletAddress: string) => {
      setStep('signing')
      setErrorMessage(null)

      let nonceRes: Response
      try {
        nonceRes = await fetch('/api/nonce', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress }),
        })
      } catch {
        setStep('error')
        setErrorMessage('Network error. Please try again.')
        signingRef.current = false
        return
      }

      const { nonce } = (await nonceRes.json()) as { nonce?: string }
      if (!nonce) {
        setStep('error')
        setErrorMessage('Failed to start sign-in. Please try again.')
        signingRef.current = false
        return
      }

      const message = `Sign in to The Quest: ${nonce}`

      signMessage(
        message,
        async (signature: string, key: string | undefined) => {
          if (!key) {
            setStep('error')
            setErrorMessage('Wallet did not return a signing key.')
            signingRef.current = false
            return
          }
          setStep('verifying')
          const result = await walletSignIn(walletAddress, signature, key)
          if ('error' in result) {
            setStep('error')
            setErrorMessage(result.message)
            signingRef.current = false
          } else {
            onSuccess(result.redirectTo)
          }
        },
        (err: Error) => {
          const msg = err?.message ?? ''
          const cancelled =
            msg.toLowerCase().includes('declined') ||
            msg.toLowerCase().includes('cancel') ||
            msg.toLowerCase().includes('reject')
          setStep('error')
          setErrorMessage(
            cancelled
              ? 'Signing was cancelled. Please try again.'
              : 'Wallet signing failed. Please try again.'
          )
          signingRef.current = false
        }
      )
    },
    [signMessage, onSuccess]
  )

  useEffect(() => {
    if (isConnected && usedAddresses.length > 0 && !signingRef.current) {
      signingRef.current = true
      void startSigningFlow(usedAddresses[0])
    }
  }, [isConnected, usedAddresses, startSigningFlow])

  const handleRetry = () => {
    signingRef.current = false
    setStep('connecting')
    setErrorMessage(null)
    if (isConnected) disconnect()
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{cfg.backButton}</span>
      </button>

      <div className="flex flex-col gap-1 text-center">
        <h3 className="text-2xl font-black uppercase tracking-widest text-foreground font-heading">
          {cfg.title}
        </h3>
        <p className="text-sm text-muted-foreground">{cfg.subtitle}</p>
      </div>

      {step === 'connecting' && <WalletSelector onConnected={() => {}} />}

      {(step === 'signing' || step === 'verifying') && (
        <div className="flex flex-col items-center gap-3 py-6">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground text-center">
            {step === 'signing' ? cfg.signingLabel : cfg.verifyingLabel}
          </p>
        </div>
      )}

      {step === 'error' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/30 rounded-[10px] px-4 py-3">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive leading-snug">{errorMessage}</p>
          </div>
          <Button variant="outline" onClick={handleRetry} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            <span className="uppercase tracking-widest text-sm font-bold">{cfg.retryButton}</span>
          </Button>
        </div>
      )}
    </div>
  )
}
