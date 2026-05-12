import { Button } from '@/components/ui/button'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export function HeroActions() {
  const { primaryCta, secondaryCta } = QUEST_CONFIG.hero

  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
      <Button variant="default" size="lg">
        {primaryCta}
      </Button>
      <Button variant="secondary" size="lg">
        {secondaryCta}
      </Button>
    </div>
  )
}
