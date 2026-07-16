import { LeftSectionHeading } from '@/components/atoms/LeftSectionHeading'
import { ScrollReveal } from '@/components/atoms/ScrollReveal'
import { SectionWrapper } from '@/components/atoms/SectionWrapper'
import { FeatureCard } from '@/components/molecules/FeatureCard'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export function Arsenal() {
  return (
    <SectionWrapper
      id="arsenal"
      className="dark"
      style={{ backgroundColor: 'oklch(0.10 0.003 49.3)' }}
    >
      <ScrollReveal direction="left">
        <LeftSectionHeading
          chapterLabel={QUEST_CONFIG.arsenal.chapterLabel}
          title={QUEST_CONFIG.arsenal.title}
          subtext={QUEST_CONFIG.arsenal.subtext}
        />
      </ScrollReveal>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {QUEST_CONFIG.arsenal.features.map((feature, i) => (
          <ScrollReveal key={feature.id} delay={i * 100}>
            <FeatureCard {...feature} />
          </ScrollReveal>
        ))}
      </div>
    </SectionWrapper>
  )
}
