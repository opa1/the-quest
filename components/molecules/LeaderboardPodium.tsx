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
    <>
      {/* Mobile / small tablet — 2-col grid, rank 1 full width top */}
      <div className="grid grid-cols-2 gap-4 lg:hidden">
        {first && (
          <div className="col-span-2">
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
        {second && (
          <div className="col-span-1">
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
        {third && (
          <div className="col-span-1">
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

      {/* Desktop — rank 2 left, rank 1 center elevated, rank 3 right */}
      <div className="hidden lg:flex lg:items-end lg:gap-6">
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
        {first && (
          <div className="flex-1 -mt-8">
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
    </>
  )
}
