import { QuestLogo } from '@/components/atoms/QuestLogo'
import { ScrollReveal } from '@/components/atoms/ScrollReveal'
import { SectionWrapper } from '@/components/atoms/SectionWrapper'
import { FooterLinks } from '@/components/molecules/FooterLinks'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export function SiteFooter() {
  return (
    <SectionWrapper
      as="footer"
      className="bg-background border-t border-border/30"
      innerClassName="flex flex-col items-center gap-6 py-12 sm:py-12 lg:py-12"
    >
      <ScrollReveal className="flex flex-col items-center gap-6 w-full">
        <QuestLogo />
        <FooterLinks />
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 text-center">
          {QUEST_CONFIG.footer.copyright}
        </p>
      </ScrollReveal>
    </SectionWrapper>
  )
}
