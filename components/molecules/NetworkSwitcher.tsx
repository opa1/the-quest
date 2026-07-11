"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { switchNetwork } from "@/app/actions/network"
import { activeNetworkFromCookie, type Network } from "@/lib/config/network"
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
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [network, setNetwork] = useState<Network>("Preprod")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setNetwork(activeNetworkFromCookie())
    setMounted(true)
  }, [])

  if (!ENABLED || !mounted) return null

  const isMainnet = network === "Mainnet"

  const select = (target: Network) => {
    if (target === network) return
    startTransition(async () => {
      await switchNetwork(target)
      // Land on home: the target network has its own session.
      router.push("/")
      router.refresh()
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
