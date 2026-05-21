import RecordStatCard from '@/components/atoms/RecordStatCard'
import { getRankFromCredits } from '@/lib/utils/rank'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import type { RecordStats } from '@/lib/types/missions'

interface RecordStatsStripProps {
  stats: RecordStats
}

export default function RecordStatsStrip({ stats }: RecordStatsStripProps) {
  const values: Record<string, string | number> = {
    completed: stats.completed,
    credits: stats.credits.toLocaleString(),
    rank: getRankFromCredits(stats.credits),
    proofs: stats.proofs,
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {QUEST_CONFIG.record.stats.map((stat) => (
        <RecordStatCard
          key={stat.key}
          iconName={stat.icon}
          label={stat.label}
          value={values[stat.key]}
          highlight={stat.key === 'credits' || stat.key === 'proofs'}
        />
      ))}
    </div>
  )
}
