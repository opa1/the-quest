'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/stores/auth.store'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

const { danger: cfg } = QUEST_CONFIG.settings.sections

export default function DangerZoneBlock() {
  const router = useRouter()
  const { signOut } = useAuthStore()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <Card className="bg-card border border-destructive/20 rounded-[16px] p-6 flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-black uppercase tracking-widest text-destructive">{cfg.title}</h2>
      </div>

      <Separator />

      {/* Sign out row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-foreground uppercase tracking-widest">
            {cfg.signOutLabel}
          </span>
          <span className="text-xs text-muted-foreground">{cfg.signOutSubtext}</span>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleSignOut}
          className="shrink-0"
        >
          <span className="uppercase tracking-widest text-xs font-bold">{cfg.signOutLabel}</span>
        </Button>
      </div>

    </Card>
  )
}
