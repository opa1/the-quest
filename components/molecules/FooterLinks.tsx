import { FooterLink } from '@/components/atoms/FooterLink'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export function FooterLinks() {
  return (
    <div className="flex items-center gap-8 flex-wrap justify-center">
      {QUEST_CONFIG.footer.links.map((link) => (
        <FooterLink key={link.href} label={link.label} href={link.href} />
      ))}
    </div>
  )
}
