"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ArrowRight } from "lucide-react"
import { QuestLogo } from "@/components/atoms/QuestLogo"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { QUEST_CONFIG } from "@/lib/config/quest.config"
import { cn } from "@/lib/utils"
import { useAuthGuard } from "@/lib/hooks/useAuthGuard"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const { guardedNavigate } = useAuthGuard()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-75 flex-col border-l border-border/50 bg-background p-0 sm:w-90"
      >
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
          <QuestLogo />
        </div>

        {/* Nav links */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
          {QUEST_CONFIG.nav.links.map((link) => (
            <SheetClose asChild key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-3.5",
                  "text-sm font-semibold tracking-widest uppercase",
                  "text-muted-foreground transition-colors duration-150",
                  "hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {link.label}
                <ArrowRight className="size-3.5 opacity-40" />
              </Link>
            </SheetClose>
          ))}
        </nav>

        {/* Divider + CTAs */}
        <div className="flex flex-col gap-3 border-t border-border/40 px-6 py-6">
          <Button
            variant="default"
            size="lg"
            className="w-full"
            asChild
            onClick={() => guardedNavigate("/realm")}
          >
            <span className="text-sm font-bold tracking-widest uppercase">
              Start Your Quest
            </span>
          </Button>
          <Button variant="outline" size="lg" className="w-full" asChild>
            <a href="#bounty-board" onClick={() => setOpen(false)}>
              <span className="text-sm font-bold tracking-widest uppercase">
                Browse The Board
              </span>
            </a>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
