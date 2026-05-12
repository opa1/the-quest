import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ChapterLabel } from '@/components/atoms/ChapterLabel'
import { SectionTitle } from '@/components/atoms/SectionTitle'
import { OathDivider } from '@/components/atoms/OathDivider'
import { ManifestoLine } from '@/components/atoms/ManifestoLine'
import { Button } from '@/components/ui/button'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export function TheOath() {
  const { chapterLabel, title, subtext, manifesto, ctaLabel, ctaHref, topDividerIcon, bottomDividerIcon } =
    QUEST_CONFIG.oath

  return (
    <section id="oath" className="bg-background">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-10 py-32 text-center">
        <ChapterLabel label={chapterLabel} variant="text" />

        <div className="mt-4">
          <SectionTitle title={title} subtext={subtext} />
        </div>

        <OathDivider icon={topDividerIcon} className="mt-16 max-w-xl" />

        <div className="mt-12 flex flex-col items-center gap-8">
          {manifesto.map((line) => (
            <ManifestoLine key={line.id} text={line.text} size={line.size} />
          ))}
        </div>

        <OathDivider icon={bottomDividerIcon} className="mt-12 max-w-xl" />

        <div className="mt-12">
          <Button size="lg" asChild>
            <Link href={ctaHref}>
              <span className="text-sm uppercase tracking-widest">{ctaLabel}</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
