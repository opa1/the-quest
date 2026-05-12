import Link from "next/link"
import { QuestLogo } from "@/components/atoms/QuestLogo"
import { MobileNav } from "@/components/molecules/MobileNav"
import { Button } from "@/components/ui/button"
import { QUEST_CONFIG } from "@/lib/config/quest.config"
import { cn } from "@/lib/utils"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link href="/">
          <QuestLogo />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {QUEST_CONFIG.nav.links.map((link) => {
            const isActive = link.href === "#war-room"
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-sm tracking-wider uppercase transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
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
          <Button variant="default" className="hidden lg:block">
            START QUEST
          </Button>
          <div className="lg:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  )
}
