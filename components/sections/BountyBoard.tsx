import { ChapterLabel } from '@/components/atoms/ChapterLabel'
import { SectionTitle } from '@/components/atoms/SectionTitle'
import { BountyCard } from '@/components/molecules/BountyCard'
import { Button } from '@/components/ui/button'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export function BountyBoard() {
  const { chapterLabel, title, subtext, ctaLabel } = QUEST_CONFIG.bountyBoard

  return (
    <section id="bounty-board" className="bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-10 py-32">
        <div className="flex justify-center">
          <ChapterLabel label={chapterLabel} />
        </div>

        <SectionTitle title={title} subtext={subtext} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {QUEST_CONFIG.bounties.map((bounty) => (
            <BountyCard key={bounty.id} {...bounty} />
          ))}
        </div>

        <div className="flex justify-center">
          <Button variant="outline">
            <span className="uppercase tracking-widest">{ctaLabel}</span>
          </Button>
        </div>
      </div>
    </section>
  )
}
