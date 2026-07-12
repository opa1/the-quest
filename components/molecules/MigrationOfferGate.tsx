"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import {
  getMigrationOffer,
  migrateProfile,
  dismissMigration,
} from "@/app/actions/migration"
import type { Network } from "@/lib/config/network"

type Offer = {
  network: Network
  source: { username: string | null; avatar_url: string | null }
  eligible: boolean
  bonusAmount: number
}

type View = "hidden" | "offer" | "bonus"

interface MigrationOfferGateProps {
  // When true (onboarding), a fullscreen overlay blocks interaction while the
  // cross-network check runs, so the user can't start onboarding mid-check.
  blockWhileChecking?: boolean
}

// Shown once a signed-in user is found to have a matching profile on the other
// network. Offers a one-tap migration; on success, celebrates the welcome bonus
// for eligible testnet users. Dismissal and completion are both persisted
// server-side, so this never re-nags.
export default function MigrationOfferGate({
  blockWhileChecking = false,
}: MigrationOfferGateProps) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [offer, setOffer] = useState<Offer | null>(null)
  const [view, setView] = useState<View>("hidden")
  const [grantedBonus, setGrantedBonus] = useState(0)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let alive = true
    getMigrationOffer()
      .then((res) => {
        if (!alive) return
        if (res.available) {
          setOffer({
            network: res.network,
            source: res.source,
            eligible: res.eligible,
            bonusAmount: res.bonusAmount,
          })
          setView("offer")
        }
        setChecking(false)
      })
      .catch(() => {
        if (alive) setChecking(false)
      })
    return () => {
      alive = false
    }
  }, [])

  // Leave for the realm once the flow is done. Runs only after the user has seen
  // (and closed) the bonus — never mid-migration, which would skip the reveal.
  const finish = () => {
    setView("hidden")
    router.push("/realm")
    router.refresh()
  }

  const handleMigrate = () => {
    startTransition(async () => {
      const res = await migrateProfile()
      if ("success" in res && res.success) {
        const bonus =
          "bonusAmount" in res && res.bonusAmount ? res.bonusAmount : 0
        if (bonus > 0) {
          setGrantedBonus(bonus)
          setView("bonus")
          // Intentionally do NOT navigate here — wait for the user to close the
          // bonus dialog, otherwise the redirect unmounts it before it's seen.
        } else {
          finish()
        }
      }
    })
  }

  const handleDismiss = () => {
    startTransition(async () => {
      await dismissMigration()
      setView("hidden")
    })
  }

  // Block onboarding interaction until we know whether an offer exists.
  if (blockWhileChecking && checking && view === "hidden") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-sm">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Checking your account…
        </span>
      </div>
    )
  }

  if (view === "hidden" || !offer) return null

  if (view === "bonus") {
    return (
      <Dialog open onOpenChange={finish}>
        <DialogContent showCloseButton={false} className="text-center">
          <DialogHeader className="items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Sparkles className="h-7 w-7" />
            </span>
            <DialogTitle className="text-lg uppercase tracking-widest">
              Welcome Bonus Unlocked
            </DialogTitle>
            <DialogDescription>
              As a founding testnet operative, you&apos;ve earned a head start.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-1 py-2">
            <span className="font-heading text-4xl font-black text-primary">
              +{grantedBonus.toLocaleString("en-US")}
            </span>
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Points added
            </span>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={finish}>
              <span className="text-sm font-bold tracking-widest uppercase">
                Enter The Quest
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // offer view — copy adapts to the direction of migration
  const name = offer.source.username ? `@${offer.source.username}` : "your account"
  const toMainnet = offer.network === "Mainnet"
  const title = toMainnet ? "Welcome to Mainnet" : "Explore Testnet"
  const description = toMainnet
    ? `We found ${name} from testnet. Bring your profile over to start earning real ADA — your missions and history stay on a clean slate.`
    : `We found ${name} from mainnet. Bring your profile over to explore with test ADA (tADA). No missions or history are carried over.`

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) handleDismiss()
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-lg uppercase tracking-widest">
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {offer.eligible && offer.bonusAmount > 0 && (
          <div className="flex items-center gap-3 rounded-[12px] border border-primary/40 bg-primary/5 px-4 py-3">
            <Sparkles className="h-5 w-5 shrink-0 text-primary" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
                Founding tester bonus
              </span>
              <span className="text-sm font-bold text-foreground">
                +{offer.bonusAmount.toLocaleString("en-US")} points on migration
              </span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={handleDismiss}
            disabled={isPending}
            className="sm:mr-auto"
          >
            <span className="text-xs font-bold tracking-widest uppercase">
              Not now
            </span>
          </Button>
          <Button onClick={handleMigrate} disabled={isPending}>
            <span className="text-sm font-bold tracking-widest uppercase">
              {isPending ? "Migrating…" : "Migrate my account"}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
