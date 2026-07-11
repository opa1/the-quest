"use client"

import { useEffect, useState } from "react"
import { Hammer } from "lucide-react"
import { SocialLinks } from "@/components/molecules/SocialLinks"

// Cycles beneath the progress bar to keep the wait feeling alive.
const STATUS_MESSAGES = [
  "Migrating operatives to the new realm…",
  "Recalibrating the on-chain ledger…",
  "Polishing the treasury vault…",
  "Sharpening the smart contracts…",
  "Reticulating splines…",
  "Summoning the deployment daemons…",
]

const RETURN_KEY = "maintenance_return_to"

export default function MaintenancePage() {
  const [index, setIndex] = useState(0)

  // Cycle the status line.
  useEffect(() => {
    const id = setInterval(
      () => setIndex((n) => (n + 1) % STATUS_MESSAGES.length),
      2600
    )
    return () => clearInterval(id)
  }, [])

  // Remember where the user was (from the ?from= param the middleware set), and
  // poll for maintenance ending — then send them right back to that page.
  useEffect(() => {
    const from = new URLSearchParams(window.location.search).get("from")
    if (from && from !== "/maintenance") {
      localStorage.setItem(RETURN_KEY, from)
    }

    const check = async () => {
      try {
        const res = await fetch("/api/maintenance", { cache: "no-store" })
        const { active } = (await res.json()) as { active: boolean }
        if (!active) {
          const target = localStorage.getItem(RETURN_KEY) || "/"
          localStorage.removeItem(RETURN_KEY)
          window.location.href = target
        }
      } catch {
        // network hiccup — try again next tick
      }
    }

    check()
    const id = setInterval(check, 15000)
    return () => clearInterval(id)
  }, [])

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 text-center"
      style={{
        backgroundImage:
          "radial-gradient(circle, oklch(1 0 0 / 0.035) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <style>{`
        @keyframes maintenance-slide {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(420%); }
        }
      `}</style>

      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-8">
        {/* pulsing forge icon */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-2xl bg-primary/20" />
          <Hammer className="relative h-9 w-9 animate-bounce text-primary" />
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-bold tracking-[0.3em] text-primary uppercase">
            Under Construction
          </span>
          <h1 className="font-heading text-3xl leading-tight font-black text-foreground uppercase md:text-5xl">
            The Forge Is Hot
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Our developers are deep in the mines upgrading the realm. The Quest
            will return sharper than ever — hang tight, operative.
          </p>
        </div>

        {/* indeterminate progress + cycling status */}
        <div className="flex w-full flex-col gap-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
            <div
              className="h-full w-1/3 rounded-full bg-primary"
              style={{
                animation: "maintenance-slide 1.6s ease-in-out infinite",
              }}
            />
          </div>
          <p
            key={index}
            className="animate-in fade-in text-xs font-semibold tracking-widest text-muted-foreground uppercase"
          >
            {STATUS_MESSAGES[index]}
          </p>
        </div>

        {/* stay informed */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <p className="text-[11px] font-bold tracking-widest text-muted-foreground/80 uppercase">
            Stay in the loop — follow us
          </p>
          <SocialLinks iconSize={22} />
        </div>
      </div>
    </main>
  )
}
