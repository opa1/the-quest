"use client"

import { useAda } from "@/lib/hooks/useAda"

interface AdaRewardProps {
  lovelace: number
}

export function AdaReward({ lovelace }: AdaRewardProps) {
  const { adaLabel } = useAda()

  if (!lovelace || lovelace <= 0) return null

  const ada = lovelace / 1_000_000

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-2xl font-black text-primary">
        ◈ {ada % 1 === 0 ? ada.toFixed(0) : ada.toFixed(2)} {adaLabel}
      </span>
    </div>
  )
}
