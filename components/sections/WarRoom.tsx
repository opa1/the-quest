import { ChapterLabel } from "@/components/atoms/ChapterLabel"
import { SectionHeading } from "@/components/atoms/SectionHeading"
import { AvatarStack } from "@/components/atoms/AvatarStack"
import { ScrollReveal } from "@/components/atoms/ScrollReveal"
import { SectionWrapper } from "@/components/atoms/SectionWrapper"
import { HeroActions } from "@/components/molecules/HeroActions"
import { OperativeStack } from "@/components/molecules/OperativeStack"
import { QUEST_CONFIG } from "@/lib/config/quest.config"

export function WarRoom() {
  const {
    chapterLabel,
    headlineTop,
    headlineBottom,
    subtext,
    statLabel,
    avatarStack,
  } = QUEST_CONFIG.hero
  const { activeOperatives } = QUEST_CONFIG.stats

  return (
    <SectionWrapper
      id="war-room"
      className="relative min-h-screen bg-background pt-16"
      innerClassName="flex min-h-screen items-center pt-24 pb-16 sm:pb-16 lg:pb-16"
      style={{
        backgroundImage:
          "radial-gradient(circle, oklch(1 0 0 / 0.035) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="flex w-full flex-col-reverse items-center gap-12 lg:flex-row lg:items-stretch lg:gap-8">
        <ScrollReveal className="flex flex-1 flex-col gap-8 lg:basis-[55%]">
          <ChapterLabel label={chapterLabel} />
          <SectionHeading topLine={headlineTop} bottomLine={headlineBottom} />
          <p className="max-w-lg border-l-2 border-primary pl-4 text-base leading-relaxed text-muted-foreground">
            {subtext}
          </p>
          <HeroActions />
          <AvatarStack
            avatars={avatarStack as unknown as string[]}
            count={activeOperatives}
            label={statLabel}
          />
        </ScrollReveal>

        <ScrollReveal
          direction="right"
          delay={200}
          className="flex w-full shrink-0 justify-center lg:basis-[45%] lg:justify-end"
        >
          <OperativeStack />
        </ScrollReveal>
      </div>
    </SectionWrapper>
  )
}
