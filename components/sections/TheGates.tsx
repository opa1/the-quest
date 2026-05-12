import { ChapterLabel } from '@/components/atoms/ChapterLabel'
import { Button } from '@/components/ui/button'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export function TheGates() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${QUEST_CONFIG.gates.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-background/60 z-0" />

      <div className="relative z-10 flex flex-col items-center gap-8 text-center px-10 max-w-3xl mx-auto">
        <ChapterLabel
          label={QUEST_CONFIG.gates.chapterLabel}
          variant="text"
          decorated
        />

        <h2 className="text-7xl md:text-8xl lg:text-9xl font-black uppercase text-foreground font-heading leading-none tracking-tight">
          {QUEST_CONFIG.gates.title}
        </h2>

        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
          {QUEST_CONFIG.gates.subtext}
        </p>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <Button variant="default" size="lg" asChild>
            <a href={QUEST_CONFIG.gates.primaryCta.href}>
              <span className="uppercase tracking-widest text-sm font-bold">
                {QUEST_CONFIG.gates.primaryCta.label}
              </span>
            </a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href={QUEST_CONFIG.gates.secondaryCta.href}>
              <span className="uppercase tracking-widest text-sm font-bold">
                {QUEST_CONFIG.gates.secondaryCta.label}
              </span>
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
