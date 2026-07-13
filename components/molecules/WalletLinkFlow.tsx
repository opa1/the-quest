'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Loader2, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCardano } from '@cardano-foundation/cardano-connect-with-wallet'
import { NetworkType } from '@cardano-foundation/cardano-connect-with-wallet-core'
import { linkWalletWithSignature } from '@/app/actions/profile'
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

const LINK_MESSAGE_PREFIX = 'Link wallet to The Quest'

type LinkStep = 'connecting' | 'signing' | 'verifying' | 'error'

interface WalletLinkFlowProps {
  onLinked: (address: string) => void
}

export function WalletLinkFlow({ onLinked }: WalletLinkFlowProps) {
  const walletNetwork =
    activeNetworkFromCookie() === 'Mainnet' ? NetworkType.MAINNET : NetworkType.TESTNET
  const { isConnected, usedAddresses, unusedAddresses, signMessage, disconnect } =
    useCardano({
      limitNetwork: walletNetwork,
    })
  const [step, setStep] = useState<LinkStep>('connecting')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const signingRef = useRef(false)

  const startLinkFlow = useCallback(
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
        setErrorMessage('Failed to start verification. Please try again.')
        signingRef.current = false
        return
      }

      const message = `${LINK_MESSAGE_PREFIX}: ${nonce}`

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
          const result = await linkWalletWithSignature(walletAddress, signature, key, nonce)
          if ('error' in result) {
            setStep('error')
            setErrorMessage(result.message)
            signingRef.current = false
          } else {
            onLinked(walletAddress)
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
    [signMessage, onLinked]
  )

  useEffect(() => {
    // A wallet with no transaction history on this network exposes no *used*
    // addresses, so fall back to an unused one — gating on usedAddresses alone
    // leaves a fresh wallet stuck here forever with nothing on screen. Both
    // belong to the same account, and the wallet signs with its stake key
    // regardless, so ownership still verifies against the address we claim.
    const address = usedAddresses[0] ?? unusedAddresses[0]
    if (isConnected && address && !signingRef.current) {
      signingRef.current = true
      void startLinkFlow(address)
    }
  }, [isConnected, usedAddresses, unusedAddresses, startLinkFlow])

  const handleRetry = () => {
    signingRef.current = false
    setStep('connecting')
    setErrorMessage(null)
    if (isConnected) disconnect()
  }

  return (
    <div className="flex flex-col gap-4">
      {step === 'connecting' && (
        <>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Select your wallet below. You will be asked to sign a message to verify ownership.
          </p>
          <WalletSelector onConnected={() => {}} />
        </>
      )}

      {(step === 'signing' || step === 'verifying') && (
        <div className="flex flex-col items-center gap-3 py-6">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground text-center">
            {step === 'signing'
              ? 'Please sign the message in your wallet to verify ownership...'
              : 'Verifying signature...'}
          </p>
        </div>
      )}

      {step === 'error' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/30 rounded-[10px] px-4 py-3">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive leading-snug">{errorMessage}</p>
          </div>
          <Button variant="outline" onClick={handleRetry} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            <span className="uppercase tracking-widest text-sm font-bold">Try Again</span>
          </Button>
        </div>
      )}
    </div>
  )
}
