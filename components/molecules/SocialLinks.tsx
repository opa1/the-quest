import { IconBrandX, IconBrandDiscord } from "@tabler/icons-react"
import { QUEST_CONFIG } from "@/lib/config/quest.config"
import { cn } from "@/lib/utils"

interface SocialLinksProps {
  className?: string
  iconSize?: number
}

export function SocialLinks({ className, iconSize = 20 }: SocialLinksProps) {
  const { x, discord } = QUEST_CONFIG.social

  const links = [
    { href: x, label: "Follow The Quest on X", Icon: IconBrandX },
    { href: discord, label: "Join The Quest on Discord", Icon: IconBrandDiscord },
  ]

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {links.map(({ href, label, Icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Icon size={iconSize} stroke={1.75} />
        </a>
      ))}
    </div>
  )
}
