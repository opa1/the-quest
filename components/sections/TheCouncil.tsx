import { ChapterLabel } from '@/components/atoms/ChapterLabel'
import { SectionTitle } from '@/components/atoms/SectionTitle'
import { FAQList } from '@/components/molecules/FAQList'
import { Button } from '@/components/ui/button'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export function TheCouncil() {
  const { chapterLabel, title, subtext, ctaSubtext, ctaLabel, ctaHref } = QUEST_CONFIG.council

  return (
    <section id="council" className="bg-background">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center px-10 py-32">
        <div className="flex flex-col items-center gap-4 text-center">
          <ChapterLabel label={chapterLabel} variant="text" decorated />
          <SectionTitle title={title} subtext={subtext} />
        </div>

        <div className="mx-auto mt-16 w-full max-w-3xl">
          <FAQList />
        </div>

        <div className="mt-16 flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">{ctaSubtext}</p>
          <Button variant="default" size="lg" asChild>
            <a href={ctaHref}>
              <span className="text-sm font-bold uppercase tracking-widest">{ctaLabel}</span>
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
