import { LeftSectionHeading } from '@/components/atoms/LeftSectionHeading'
import { FeatureCard } from '@/components/molecules/FeatureCard'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export function Arsenal() {
  return (
    <section id="arsenal" className="bg-background">
      <div className="mx-auto max-w-7xl px-10 py-32">
        <LeftSectionHeading
          chapterLabel={QUEST_CONFIG.arsenal.chapterLabel}
          title={QUEST_CONFIG.arsenal.title}
          subtext={QUEST_CONFIG.arsenal.subtext}
        />

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {QUEST_CONFIG.arsenal.features.map((feature) => (
            <FeatureCard
              key={feature.id}
              {...feature}
              ctaLabel={QUEST_CONFIG.arsenal.ctaLabel}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
