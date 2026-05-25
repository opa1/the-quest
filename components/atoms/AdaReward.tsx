interface AdaRewardProps {
  lovelace: number
}

export function AdaReward({ lovelace }: AdaRewardProps) {
  if (!lovelace || lovelace <= 0) return null

  const ada = lovelace / 1_000_000

  return (
    <div className="flex items-center gap-1">
      <span className="text-primary font-bold text-sm">◈</span>
      <span className="text-sm font-bold text-foreground">
        {ada % 1 === 0 ? ada.toFixed(0) : ada.toFixed(2)} ADA
      </span>
    </div>
  )
}
