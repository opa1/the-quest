'use client'

import { useState, useEffect } from 'react'
import { useCardano } from '@cardano-foundation/cardano-connect-with-wallet'
import WalletOption from '@/components/atoms/WalletOption'
import WalletNoneState from '@/components/atoms/WalletNoneState'

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
  const { installedExtensions, connect, isConnected, usedAddresses } = useCardano()
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null)

  useEffect(() => {
    if (isConnected && usedAddresses.length > 0 && connectingWallet) {
      onConnected(usedAddresses[0])
      setConnectingWallet(null)
    }
  }, [isConnected, usedAddresses, connectingWallet, onConnected])

  const handleConnect = async (walletId: string) => {
    try {
      setConnectingWallet(walletId)
      await connect(walletId, undefined, () => setConnectingWallet(null))
    } catch {
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
    </div>
  )
}
