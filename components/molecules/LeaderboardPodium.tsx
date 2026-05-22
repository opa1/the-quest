import PodiumFeatured from '@/components/molecules/PodiumFeatured'
import PodiumStandard from '@/components/molecules/PodiumStandard'
import { getRankFromCredits } from '@/lib/utils/rank'
import type { LeaderboardEntry } from '@/lib/types/missions'

interface LeaderboardPodiumProps {
  topThree: LeaderboardEntry[]
}

export default function LeaderboardPodium({ topThree }: LeaderboardPodiumProps) {
  if (topThree.length === 0) return null

  const [first, second, third] = topThree

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">

      {/* Rank 2 — left */}
      {second && (
        <div className="flex-1">
          <PodiumStandard
            rank={second.rank}
            username={second.username ?? 'Unknown'}
            badge={getRankFromCredits(second.credits)}
            xp={second.credits}
            bounties={second.completed}
            avatar={second.avatar_url}
          />
        </div>
      )}

      {/* Rank 1 — center, elevated on desktop */}
      {first && (
        <div className="flex-1 md:-mt-8">
          <PodiumFeatured
            rank={first.rank}
            username={first.username ?? 'Unknown'}
            badge={getRankFromCredits(first.credits)}
            xp={first.credits}
            bounties={first.completed}
            avatar={first.avatar_url}
          />
        </div>
      )}

      {/* Rank 3 — right */}
      {third && (
        <div className="flex-1">
          <PodiumStandard
            rank={third.rank}
            username={third.username ?? 'Unknown'}
            badge={getRankFromCredits(third.credits)}
            xp={third.credits}
            bounties={third.completed}
            avatar={third.avatar_url}
          />
        </div>
      )}

    </div>
  )
}
