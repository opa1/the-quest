import { Button } from '@/components/ui/button'
import { CommLinkInput } from '@/components/atoms/CommLinkInput'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export function HeroActions() {
  const { primaryCta, inputPlaceholder, inputCta } = QUEST_CONFIG.hero

  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
      <Button variant="default" size="lg">
        {primaryCta}
      </Button>
      <CommLinkInput
        placeholder={inputPlaceholder}
        ctaLabel={inputCta}
      />
    </div>
  )
}
