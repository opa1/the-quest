import Link from 'next/link'
import { Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { cn } from '@/lib/utils'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-10">
        <Link
          href="/"
          className="font-heading text-xl font-black uppercase tracking-widest text-primary"
        >
          THE QUEST
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {QUEST_CONFIG.nav.links.map((link) => {
            const isActive = link.href === '#war-room'
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative text-sm uppercase tracking-wider transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="size-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="size-4" />
          </Button>
          <Button variant="default">START QUEST</Button>
        </div>
      </div>
    </header>
  )
}
