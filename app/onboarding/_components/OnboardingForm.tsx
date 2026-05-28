'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from 'lucide-react'
import { ChapterLabel } from '@/components/atoms/ChapterLabel'
import WalletConnectBlock from '@/components/molecules/WalletConnectBlock'
import { completeOnboarding } from '@/app/actions/onboarding'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

interface OnboardingFormProps {
  redirectTo: string
  defaultUsername: string
  avatarUrl: string | null
  xHandle: string | null
  signupMethod?: 'x' | 'wallet'
  preConnectedWallet?: string | null
}

export default function OnboardingForm({
  redirectTo,
  defaultUsername,
  avatarUrl,
  xHandle,
  signupMethod = 'x',
  preConnectedWallet = null,
}: OnboardingFormProps) {
  const isWalletUser = signupMethod === 'wallet'
  const [username, setUsername] = useState(defaultUsername)
  const [walletAddress, setWalletAddress] = useState<string | null>(preConnectedWallet)
  const [walletSkipped, setWalletSkipped] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { onboarding } = QUEST_CONFIG

  const handleSubmit = async () => {
    if (!username.trim() || username.trim().length < onboarding.usernameMinLength) {
      setError(onboarding.usernameRequired)
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await completeOnboarding({
      username: username.trim(),
      walletAddress: walletSkipped ? null : walletAddress,
      redirectTo,
    })

    if (result?.error === 'username_taken') {
      setError(onboarding.usernameTaken)
      setIsSubmitting(false)
      return
    }

    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <ChapterLabel label="THE QUEST" />
        <h1 className="text-4xl font-black uppercase text-foreground font-heading leading-none tracking-tight">
          {onboarding.title}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
          {onboarding.subtext}
        </p>
      </div>

      {avatarUrl && (
        <div className="flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl}
            alt={xHandle ?? 'Avatar'}
            className="w-16 h-16 rounded-full border-2 border-primary/40 object-cover"
          />
          {xHandle && (
            <span className="text-xs text-muted-foreground">@{xHandle}</span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="username"
          className="text-xs uppercase tracking-widest font-semibold text-muted-foreground"
        >
          {onboarding.usernameLabel}
        </Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value)
            setError(null)
          }}
          placeholder={onboarding.usernamePlaceholder}
          maxLength={onboarding.usernameMaxLength}
          className="h-12"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <span className="text-[11px] text-muted-foreground/60 text-right">
          {username.length}/{onboarding.usernameMaxLength}
        </span>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <Separator />

      {isWalletUser ? (
        <WalletConnectBlock
          onConnected={() => {}}
          onSkip={() => {}}
          connectedAddress={walletAddress}
          showSkip={false}
        />
      ) : (
        <>
          {!walletSkipped && (
            <WalletConnectBlock
              onConnected={(address) => setWalletAddress(address)}
              onSkip={() => {
                setWalletSkipped(true)
                setWalletAddress(null)
              }}
              connectedAddress={walletAddress}
            />
          )}

          {walletSkipped && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Wallet skipped</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWalletSkipped(false)}
                className="text-xs text-primary hover:text-primary/80"
              >
                Link wallet instead
              </Button>
            </div>
          )}
        </>
      )}

      <Button
        variant="default"
        size="lg"
        className="w-full"
        onClick={handleSubmit}
        disabled={isSubmitting || !username.trim()}
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        <span className="uppercase tracking-widest text-sm font-bold">
          {isSubmitting ? 'ENTERING...' : onboarding.cta}
        </span>
      </Button>
    </div>
  )
}
