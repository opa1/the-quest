"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Coins, Wallet, ShieldCheck, ArrowLeftRight } from "lucide-react"
import { activeNetworkFromCookie } from "@/lib/config/network"

const SEEN_KEY = "mainnet_welcome_seen"
// Don't collide with the migration-offer/auth flows.
const SKIP_PATHS = ["/onboarding", "/auth", "/maintenance"]

const TIPS = [
  {
    Icon: Coins,
    title: "This is real ADA",
    text: "Missions and rewards on Mainnet use real funds — no more test tokens.",
  },
  {
    Icon: Wallet,
    title: "Link your wallet",
    text: "Connect a Cardano wallet in your profile to post missions and receive payouts.",
  },
  {
    Icon: ShieldCheck,
    title: "On-chain & automatic",
    text: "Approved rewards pay out on-chain and are recorded permanently.",
  },
  {
    Icon: ArrowLeftRight,
    title: "Switch anytime",
    text: "Hop back to Testnet from Profile → Network whenever you like.",
  },
]

// One-time "welcome to Mainnet" tips for anyone (members or not) the first time
// they land on the Mainnet network. Gated by localStorage so it never re-nags.
export function MainnetWelcomeDialog() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (SKIP_PATHS.some((p) => pathname.startsWith(p))) return
    if (activeNetworkFromCookie() !== "Mainnet") return
    if (localStorage.getItem(SEEN_KEY)) return
    setOpen(true)
  }, [pathname])

  const dismiss = () => {
    localStorage.setItem(SEEN_KEY, "1")
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) dismiss()
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-lg uppercase tracking-widest">
            Welcome to Mainnet
          </DialogTitle>
          <DialogDescription>
            You&apos;re now on the real Cardano network. A few things to know:
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-3">
          {TIPS.map(({ Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">{title}</span>
                <span className="text-xs text-muted-foreground">{text}</span>
              </div>
            </li>
          ))}
        </ul>

        <DialogFooter>
          <Button className="w-full" onClick={dismiss}>
            <span className="text-sm font-bold tracking-widest uppercase">
              Let&apos;s Go
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
