'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2 } from 'lucide-react'
import XIcon from '@/components/atoms/XIcon'
import { linkXAccount } from '@/app/actions/auth'

interface LinkXBlockProps {
  xLinked: boolean
  xHandle: string | null
}

export default function LinkXBlock({ xLinked, xHandle }: LinkXBlockProps) {
  const [isLinking, setIsLinking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLinkX = async () => {
    setIsLinking(true)
    setError(null)
    const result = await linkXAccount()
    if (result && 'error' in result) {
      setError('Failed to start X linking. Please try again.')
      setIsLinking(false)
    }
    // On success, linkXAccount calls redirect() which navigates the browser
  }

  return (
    <Card className="bg-card border-border/50 rounded-[16px] p-6 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-black uppercase tracking-widest text-foreground">
          X ACCOUNT
        </h2>
        <p className="text-xs text-muted-foreground">
          Link your X account to unlock social features and display your handle.
        </p>
      </div>

      <Separator />

      {xLinked && xHandle ? (
        <div className="flex items-center gap-3 bg-muted/30 border border-border/40 rounded-[10px] px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-foreground uppercase tracking-widest">
              X Account Connected
            </span>
            <span className="text-[11px] text-muted-foreground">@{xHandle}</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Button
            variant="default"
            size="lg"
            className="w-full"
            onClick={handleLinkX}
            disabled={isLinking}
          >
            {isLinking ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <XIcon className="w-4 h-4 mr-2" />
            )}
            <span className="uppercase tracking-widest text-sm font-bold">
              {isLinking ? 'CONNECTING...' : 'CONNECT X ACCOUNT'}
            </span>
          </Button>
          {error && (
            <p className="text-xs text-destructive text-center">{error}</p>
          )}
        </div>
      )}
    </Card>
  )
}
