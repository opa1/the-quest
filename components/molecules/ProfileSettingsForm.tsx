'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2 } from 'lucide-react'
import UserAvatar from '@/components/atoms/UserAvatar'
import FormFieldError from '@/components/atoms/FormFieldError'
import { updateUsername } from '@/app/actions/profile'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

interface ProfileSettingsFormProps {
  username: string
  avatarUrl: string | null
  xHandle: string | null
}

const errorMessages: Record<string, string> = {
  username_taken: 'This username is already claimed.',
  invalid_chars:  'Only letters, numbers and underscores allowed.',
  too_short:      'Username must be at least 3 characters.',
  too_long:       'Username must be 20 characters or less.',
  update_failed:  'Failed to save. Please try again.',
}

const { profile: cfg } = QUEST_CONFIG.settings.sections

export default function ProfileSettingsForm({
  username: initialUsername,
  avatarUrl,
  xHandle,
}: ProfileSettingsFormProps) {
  const [username, setUsername] = useState(initialUsername)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setIsSubmitting(true)
    setError(null)
    setSaved(false)

    const result = await updateUsername(username)

    if ('error' in result && result.error) {
      setError(errorMessages[result.error] ?? 'Something went wrong.')
      setIsSubmitting(false)
      return
    }

    setSaved(true)
    setIsSubmitting(false)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Card className="bg-card border-border/50 rounded-[16px] p-6 flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-black uppercase tracking-widest text-foreground">{cfg.title}</h2>
        <p className="text-xs text-muted-foreground">{cfg.subtext}</p>
      </div>

      <Separator />

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <UserAvatar src={avatarUrl} username={username || 'U'} size="md" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            {cfg.avatarLabel}
          </span>
          <span className="text-xs text-muted-foreground leading-relaxed">{cfg.avatarNote}</span>
        </div>
      </div>

      {/* Username */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
            {cfg.usernameLabel}
          </Label>
          <span className="text-xs text-muted-foreground tabular-nums">{username.length}/20</span>
        </div>
        <Input
          value={username}
          onChange={(e) => { setUsername(e.target.value); setError(null) }}
          placeholder={cfg.usernamePlaceholder}
          maxLength={20}
          className="bg-muted/30 border-border/50 focus:border-primary"
        />
        <FormFieldError message={error} />
      </div>

      {/* X Handle — read only */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
          {cfg.xHandleLabel}
        </Label>
        <Input
          value={xHandle ? `@${xHandle}` : '—'}
          disabled
          className="bg-muted/20 border-border/30 text-muted-foreground"
        />
        <span className="text-xs text-muted-foreground">{cfg.xHandleNote}</span>
      </div>

      {/* Save button */}
      <Button
        variant="default"
        size="lg"
        className="w-full"
        onClick={handleSave}
        disabled={isSubmitting || saved}
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        {saved && <CheckCircle2 className="w-4 h-4 mr-2" />}
        <span className="uppercase tracking-widest text-sm font-bold">
          {isSubmitting ? cfg.savingLabel : saved ? cfg.savedLabel : cfg.saveLabel}
        </span>
      </Button>

    </Card>
  )
}
