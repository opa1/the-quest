"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { GuardedLink } from "@/components/atoms/GuardedLink"
import { QuestLogo } from "@/components/atoms/QuestLogo"
import { MobileNav } from "@/components/molecules/MobileNav"
import { NetworkSwitcher } from "@/components/molecules/NetworkSwitcher"
import { Button } from "@/components/ui/button"
import { QUEST_CONFIG } from "@/lib/config/quest.config"
import { useAuthGuard } from "@/lib/hooks/useAuthGuard"
import { cn } from "@/lib/utils"

/** '/#guild' -> 'guild'. Route links have no hash and yield null. */
function anchorId(href: string): string | null {
  const hash = href.indexOf("#")
  return hash === -1 ? null : href.slice(hash + 1)
}

export function Navbar() {
  const { guardedNavigate } = useAuthGuard()
  const pathname = usePathname()
  const [activeSection, setActiveSection] = useState("")

  useEffect(() => {
    // Only the anchor links participate in scroll-spy; route links are matched
    // against the pathname instead.
    const sectionIds = QUEST_CONFIG.nav.links
      .map((l) => anchorId(l.href))
      .filter((id): id is string => id !== null)

    const onScroll = () => {
      if (window.scrollY === 0) {
        setActiveSection("")
        return
      }
      let current = ""
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 80) {
          current = id
        }
      }
      setActiveSection(current)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link href="/">
          <QuestLogo />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {QUEST_CONFIG.nav.links.map((link) => {
            const id = anchorId(link.href)
            const isActive = id
              ? activeSection === id
              : pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <GuardedLink
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-sm tracking-wider uppercase transition-colors duration-300",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-0.5 w-full origin-left rounded-full bg-primary transition-transform duration-300",
                    isActive ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </GuardedLink>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <NetworkSwitcher />
          <Button
            variant="default"
            className="hidden lg:block"
            onClick={() => guardedNavigate('/realm')}
          >
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
