import { FooterLogo } from '@/components/atoms/FooterLogo'
import { FooterLinks } from '@/components/molecules/FooterLinks'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export function SiteFooter() {
  return (
    <footer className="bg-background border-t border-border/30 py-12 px-10">
      <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-6">
        <FooterLogo />
        <FooterLinks />
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 text-center">
          {QUEST_CONFIG.footer.copyright}
        </p>
      </div>
    </footer>
  )
}
