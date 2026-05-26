'use client'

import { useState, useEffect, useRef } from 'react'
import { useCardano } from '@cardano-foundation/cardano-connect-with-wallet'
import { NetworkType } from '@cardano-foundation/cardano-connect-with-wallet-core'
import WalletOption from '@/components/atoms/WalletOption'
import WalletNoneState from '@/components/atoms/WalletNoneState'
import { AlertCircle } from 'lucide-react'
import { CARDANO_NETWORK } from '@/lib/config/cardano.config'

// Map our config value to the library's enum.
// "Preprod" and "Preview" are both Cardano testnets — CIP-30 reports them as network id 0 (TESTNET).
const WALLET_NETWORK = CARDANO_NETWORK === 'Mainnet' ? NetworkType.MAINNET : NetworkType.TESTNET

interface WalletSelectorProps {
  onConnected: (walletAddress: string) => void
  className?: string
}

function getWalletIcon(walletId: string): string | null {
  if (typeof window === 'undefined') return null
  return (window as Window & { cardano?: Record<string, { icon?: string }> })
    .cardano?.[walletId]?.icon ?? null
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function WalletSelector({ onConnected, className }: WalletSelectorProps) {
  const { installedExtensions, connect, disconnect, isConnected, usedAddresses } = useCardano({ limitNetwork: WALLET_NETWORK })
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Ref so the effect always reads the latest value even if state batching delays the update
  const connectingRef = useRef<string | null>(null)

  useEffect(() => {
    if (isConnected && usedAddresses.length > 0 && connectingRef.current) {
      onConnected(usedAddresses[0])
      connectingRef.current = null
      setConnectingWallet(null)
    }
  }, [isConnected, usedAddresses, onConnected])

  const handleConnect = async (walletId: string) => {
    setError(null)
    connectingRef.current = walletId
    setConnectingWallet(walletId)

    try {
      // Disconnect first to clear stale hook state from a previous session.
      // Without this, if the hook already has isConnected=true (e.g. after a
      // DB-only disconnect from profile settings), connect() is a no-op and
      // the effect never fires.
      if (isConnected) {
        await disconnect()
      }

      connect(walletId, undefined, (err: unknown) => {
        console.error('Wallet connect error:', err)
        const msg = err instanceof Error ? err.message : String(err ?? 'Connection failed.')
        setError(msg)
        connectingRef.current = null
        setConnectingWallet(null)
      })
    } catch (err) {
      console.error('Wallet connect error:', err)
      const msg = err instanceof Error ? err.message : 'Connection failed. Please try again.'
      setError(msg)
      connectingRef.current = null
      setConnectingWallet(null)
    }
  }

  if (!installedExtensions || installedExtensions.length === 0) {
    return <WalletNoneState />
  }

  return (
    <div className={`flex flex-col gap-3 ${className ?? ''}`}>
      {installedExtensions.map((walletId) => (
        <WalletOption
          key={walletId}
          name={capitalize(walletId)}
          icon={getWalletIcon(walletId)}
          onConnect={() => handleConnect(walletId)}
          isConnecting={connectingWallet === walletId}
        />
      ))}
      {error && (
        <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-[10px] px-3 py-2.5">
          <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive leading-snug">{error}</p>
        </div>
      )}
    </div>
  )
}
