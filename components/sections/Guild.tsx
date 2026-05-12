import { ChapterLabel } from '@/components/atoms/ChapterLabel'
import { SectionTitle } from '@/components/atoms/SectionTitle'
import { StepNumber } from '@/components/atoms/StepNumber'
import { GuildStepCard } from '@/components/molecules/GuildStepCard'
import { Button } from '@/components/ui/button'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export function Guild() {
  const { chapterLabel, title, subtext, ctaLabel, steps } = QUEST_CONFIG.guild

  return (
    <section id="guild" className="bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-10 py-32">
        <div className="flex flex-col items-center gap-4 text-center">
          <ChapterLabel label={chapterLabel} variant="text" decorated />
          <SectionTitle title={title} subtext={subtext} />
        </div>

        <div className="relative mt-8">
          {/* Connector line — sits behind the step number circles */}
          <div className="absolute left-[16.67%] right-[16.67%] top-8 z-0 h-px bg-border/60" />

          {/* Step numbers */}
          <div className="relative z-10 grid grid-cols-3 gap-6">
            {steps.map((step) => (
              <div key={step.id} className="flex justify-center">
                <StepNumber number={step.number} />
              </div>
            ))}
          </div>

          {/* Step cards */}
          <div className="mt-6 grid grid-cols-3 gap-6">
            {steps.map((step) => (
              <GuildStepCard key={step.id} {...step} />
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <Button variant="outline" size="lg">
            <span className="text-sm uppercase tracking-widest">{ctaLabel}</span>
          </Button>
        </div>
      </div>
    </section>
  )
}
