import { ChapterLabel } from '@/components/atoms/ChapterLabel'
import { SectionHeading } from '@/components/atoms/SectionHeading'
import { AvatarStack } from '@/components/atoms/AvatarStack'
import { HeroActions } from '@/components/molecules/HeroActions'
import { OperativeStack } from '@/components/molecules/OperativeStack'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export function WarRoom() {
  const { chapterLabel, headlineTop, headlineBottom, subtext, statLabel } = QUEST_CONFIG.hero
  const { activeOperatives } = QUEST_CONFIG.stats

  return (
    <section
      id="war-room"
      className="relative min-h-screen bg-background"
      style={{
        backgroundImage:
          'radial-gradient(circle, oklch(1 0 0 / 0.035) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-10 pt-24 pb-16">
        <div className="flex w-full flex-col items-center gap-16 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex flex-1 flex-col gap-8 lg:basis-[55%]">
            <ChapterLabel label={chapterLabel} />

            <SectionHeading topLine={headlineTop} bottomLine={headlineBottom} />

            <p className="max-w-lg border-l-2 border-primary pl-4 text-base leading-relaxed text-muted-foreground">
              {subtext}
            </p>

            <HeroActions />

            <AvatarStack count={activeOperatives} label={statLabel} />
          </div>

          <div className="flex shrink-0 justify-center lg:basis-[45%] lg:justify-end">
            <OperativeStack />
          </div>
        </div>
      </div>
    </section>
  )
}
