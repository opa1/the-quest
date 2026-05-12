import { ChapterLabel } from '@/components/atoms/ChapterLabel'
import { SectionTitle } from '@/components/atoms/SectionTitle'
import { ScrollReveal } from '@/components/atoms/ScrollReveal'
import { SectionWrapper } from '@/components/atoms/SectionWrapper'
import { BountyCard } from '@/components/molecules/BountyCard'
import { Button } from '@/components/ui/button'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export function BountyBoard() {
  const { chapterLabel, title, subtext, ctaLabel } = QUEST_CONFIG.bountyBoard

  return (
    <SectionWrapper id="bounty-board" className="bg-background" innerClassName="flex flex-col gap-12">
      <ScrollReveal className="flex flex-col items-center gap-4 text-center">
        <ChapterLabel label={chapterLabel} />
        <SectionTitle title={title} subtext={subtext} />
      </ScrollReveal>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {QUEST_CONFIG.bounties.map((bounty, i) => (
          <ScrollReveal key={bounty.id} delay={i * 75}>
            <BountyCard {...bounty} />
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal delay={500} className="flex justify-center">
        <Button variant="outline">
          <span className="uppercase tracking-widest">{ctaLabel}</span>
        </Button>
      </ScrollReveal>
    </SectionWrapper>
  )
}
