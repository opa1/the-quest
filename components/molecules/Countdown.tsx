"use client"

import { useEffect, useState } from "react"
import { SocialLinks } from "@/components/molecules/SocialLinks"

function remaining(endsAt: number) {
  const ms = Math.max(0, endsAt - Date.now())
  const total = Math.floor(ms / 1000)
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    done: ms <= 0,
  }
}

export function Countdown({ endsAt }: { endsAt: number }) {
  const [t, setT] = useState(() => remaining(endsAt))

  useEffect(() => {
    const id = setInterval(() => {
      const next = remaining(endsAt)
      setT(next)
      if (next.done) {
        clearInterval(id)
        // Confirm with the server before revealing the app, so a fast client
        // clock can't reload into a still-active gate. Reload in place so the
        // user lands on the same route (now rendering the real app).
        fetch("/api/countdown", { cache: "no-store" })
          .then((r) => r.json())
          .then(({ over }) => {
            if (over) window.location.reload()
          })
          .catch(() => {
            window.location.reload()
          })
      }
    }, 1000)
    return () => clearInterval(id)
  }, [endsAt])

  const units = [
    { label: "Days", value: t.days },
    { label: "Hours", value: t.hours },
    { label: "Minutes", value: t.minutes },
    { label: "Seconds", value: t.seconds },
  ]

  return (
    <main
      className="relative flex size-full min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 text-center"
      style={{
        backgroundImage:
          "radial-gradient(circle, oklch(1 0 0 / 0.035) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-8">
        <span className="text-[11px] font-bold tracking-[0.3em] text-primary uppercase">
          The Quest · Mainnet
        </span>
        <h1 className="font-heading text-3xl leading-tight font-black text-foreground uppercase md:text-5xl">
          The Realm Opens In
        </h1>

        <div className="flex gap-3 sm:gap-5">
          {units.map((u) => (
            <div
              key={u.label}
              className="flex min-w-[70px] flex-col items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-3 py-4 sm:min-w-[88px] sm:px-6"
            >
              <span className="font-heading text-3xl font-black text-primary tabular-nums md:text-5xl">
                {String(u.value).padStart(2, "0")}
              </span>
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                {u.label}
              </span>
            </div>
          ))}
        </div>

        <p className="max-w-md text-base leading-relaxed text-muted-foreground">
          Real ADA. Real missions. On-chain forever. Be among the first
          operatives when The Quest goes live on Mainnet.
        </p>

        <div className="flex flex-col items-center gap-3 pt-2">
          <p className="text-[11px] font-bold tracking-widest text-muted-foreground/80 uppercase">
            Follow for the launch
          </p>
          <SocialLinks iconSize={22} />
        </div>
      </div>
    </main>
  )
}
