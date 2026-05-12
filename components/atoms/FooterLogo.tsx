import { cn } from '@/lib/utils'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

interface FooterLogoProps {
  className?: string
}

export function FooterLogo({ className }: FooterLogoProps) {
  return (
    <span
      className={cn(
        'text-xl font-black uppercase tracking-widest text-primary font-heading text-center',
        className
      )}
    >
      {QUEST_CONFIG.footer.logo}
    </span>
  )
}
