import { ChapterLabel } from '@/components/atoms/ChapterLabel'
import { SectionTitle } from '@/components/atoms/SectionTitle'
import { ChronicleTimeline } from '@/components/molecules/ChronicleTimeline'
import { Button } from '@/components/ui/button'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export function TheChronicle() {
  const { chapterLabel, title, subtext, ctaLabel, entries } = QUEST_CONFIG.chronicle

  return (
    <section id="chronicle" className="bg-background">
      <div className="mx-auto flex max-w-7xl flex-col px-10 py-32">
        <div className="flex flex-col items-center gap-4 text-center">
          <ChapterLabel label={chapterLabel} variant="text" decorated />
          <SectionTitle title={title} subtext={subtext} />
        </div>

        <div className="mt-16">
          <ChronicleTimeline entries={entries} />
        </div>

        <div className="mt-12 flex justify-center">
          <Button variant="outline" size="lg">
            <span className="text-sm uppercase tracking-widest">{ctaLabel}</span>
          </Button>
        </div>
      </div>
    </section>
  )
}
