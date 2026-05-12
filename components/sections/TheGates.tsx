import { ChapterLabel } from "@/components/atoms/ChapterLabel"
import { ScrollReveal } from "@/components/atoms/ScrollReveal"
import { SectionWrapper } from "@/components/atoms/SectionWrapper"
import { Button } from "@/components/ui/button"
import { QUEST_CONFIG } from "@/lib/config/quest.config"

export function TheGates() {
  return (
    <SectionWrapper
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      noContainer
      style={{
        backgroundImage: `url(${QUEST_CONFIG.gates.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 z-0 bg-black/80" />

      <ScrollReveal className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-8 px-5 text-center sm:px-8 lg:px-10">
        <ChapterLabel label={QUEST_CONFIG.gates.chapterLabel} />

        <h2 className="font-heading text-7xl leading-none font-black tracking-tight text-white uppercase md:text-8xl lg:text-9xl">
          {QUEST_CONFIG.gates.title}
        </h2>

        <p className="max-w-xl text-base leading-relaxed text-white/60 md:text-lg">
          {QUEST_CONFIG.gates.subtext}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button variant="default" size="lg" asChild>
            <a href={QUEST_CONFIG.gates.primaryCta.href}>
              <span className="text-sm font-bold tracking-widest uppercase">
                {QUEST_CONFIG.gates.primaryCta.label}
              </span>
            </a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href={QUEST_CONFIG.gates.secondaryCta.href}>
              <span className="text-sm font-bold tracking-widest uppercase">
                {QUEST_CONFIG.gates.secondaryCta.label}
              </span>
            </a>
          </Button>
        </div>
      </ScrollReveal>
    </SectionWrapper>
  )
}
