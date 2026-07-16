"use client"

import { useEffect, useState, useTransition } from "react"
import { Check, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { switchNetwork } from "@/app/actions/network"
import { networkSwitchDestination } from "@/lib/config/routes"
import {
  activeNetworkFromCookie,
  networkLabel,
  parseNetwork,
  NETWORK_SWITCHED_PARAM,
  type Network,
} from "@/lib/config/network"
import { cn } from "@/lib/utils"

// Kept behind the same flag as the Profile toggle so real users can't switch
// into the empty mainnet DB before cutover.
const ENABLED = process.env.NEXT_PUBLIC_NETWORK_SWITCH_ENABLED === "true"

const OPTIONS: { value: Network; label: string; dot: string; hint: string }[] = [
  { value: "Mainnet", label: "Mainnet", dot: "bg-primary", hint: "Real ADA" },
  { value: "Preprod", label: "Testnet", dot: "bg-amber-400", hint: "Test ADA" },
]

// Compact header network switcher. Opening the dropdown and picking a network
// is the deliberate confirmation step. Reads the active network from the cookie
// after mount (avoids a hydration mismatch) and self-hides when disabled.
export function NetworkSwitcher({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false)
  const [network, setNetwork] = useState<Network>("Preprod")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setNetwork(activeNetworkFromCookie())
    setMounted(true)

    // We got here from a network switch: confirm it, then drop the marker from
    // the URL so a refresh or share doesn't re-toast.
    const params = new URLSearchParams(window.location.search)
    const switched = parseNetwork(params.get(NETWORK_SWITCHED_PARAM))
    if (!switched) return

    toast.success(`Network switched to ${networkLabel(switched)}`)
    params.delete(NETWORK_SWITCHED_PARAM)
    const query = params.toString()
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (query ? `?${query}` : "")
    )
  }, [])

  if (!ENABLED || !mounted) return null

  const isMainnet = network === "Mainnet"

  const select = (target: Network) => {
    if (target === network) return
    startTransition(async () => {
      await switchNetwork(target)

      // Stay where the user was, because being bounced home on every switch is
      // disorienting. networkSwitchDestination sends them elsewhere only when
      // the current URL can't survive the switch (a task id belongs to one
      // database). If they have no session on the target network the protected
      // layout redirects to '/' on arrival anyway.
      const dest = networkSwitchDestination(window.location.pathname)
      const params = new URLSearchParams(
        dest === window.location.pathname ? window.location.search : ''
      )
      params.set(NETWORK_SWITCHED_PARAM, target)

      // Full page load, not router.push: the network is read from a cookie by
      // both the server and the browser Supabase client, and a soft navigation
      // leaves the already-initialised client stuck on the old network.
      window.location.href = `${dest}?${params.toString()}`
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          className={cn(
            "flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase transition-colors hover:border-primary hover:text-foreground disabled:opacity-60",
            className
          )}
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isMainnet ? "bg-primary" : "bg-amber-400"
            )}
          />
          {isMainnet ? "Mainnet" : "Testnet"}
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-52 rounded-[12px] border-border/50 bg-card"
      >
        <div className="border-b border-border/40 px-3 py-2">
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            Switch Network
          </p>
        </div>

        {OPTIONS.map((opt) => {
          const active = opt.value === network
          return (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => select(opt.value)}
              className="flex cursor-pointer items-center justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", opt.dot)} />
                <span className="text-sm font-semibold text-foreground">
                  {opt.label}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {opt.hint}
                </span>
              </span>
              {active && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
