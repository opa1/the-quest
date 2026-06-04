import { ADA_LABEL } from '@/lib/utils/currency'

interface AdaRewardProps {
  lovelace: number
}

export function AdaReward({ lovelace }: AdaRewardProps) {
  if (!lovelace || lovelace <= 0) return null

  const ada = lovelace / 1_000_000

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-2xl font-black text-primary">
        ◈ {ada % 1 === 0 ? ada.toFixed(0) : ada.toFixed(2)} {ADA_LABEL}
      </span>
    </div>
  )
}
