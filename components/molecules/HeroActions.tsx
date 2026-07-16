'use client'

import { GuardedLink } from '@/components/atoms/GuardedLink'
import { Button } from '@/components/ui/button'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

export function HeroActions() {
  const { primaryCta, secondaryCta } = QUEST_CONFIG.hero
  const { guardedNavigate } = useAuthGuard()

  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
      <Button
        variant="default"
        size="lg"
        onClick={() => guardedNavigate('/realm')}
      >
        {primaryCta}
      </Button>
      <Button variant="secondary" size="lg" asChild>
        <GuardedLink href="/missions">{secondaryCta}</GuardedLink>
      </Button>
    </div>
  )
}
