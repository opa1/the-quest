import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

type TxState = 'idle' | 'building' | 'awaiting_signature' | 'submitting' | 'confirmed' | 'failed'

interface CardanoTxStatusProps {
  state: TxState
  message?: string
}

export default function CardanoTxStatus({ state, message }: CardanoTxStatusProps) {
  if (state === 'idle') return null

  if (state === 'building') {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Building transaction...</span>
      </div>
    )
  }

  if (state === 'awaiting_signature') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
        </span>
        <span className="text-primary font-medium">Please sign in your wallet...</span>
      </div>
    )
  }

  if (state === 'submitting') {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Submitting to Cardano...</span>
      </div>
    )
  }

  if (state === 'confirmed') {
    return (
      <div className="flex items-center gap-2 text-green-400 text-sm">
        <CheckCircle2 className="w-4 h-4" />
        <span className="font-medium">Transaction confirmed</span>
      </div>
    )
  }

  if (state === 'failed') {
    return (
      <div className="flex items-center gap-2 text-destructive text-sm">
        <XCircle className="w-4 h-4" />
        <span>{message ?? 'Transaction failed'}</span>
      </div>
    )
  }

  return null
}
