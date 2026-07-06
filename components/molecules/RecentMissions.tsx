'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { BountyCard } from '@/components/molecules/BountyCard'
import BannerPlaceholder from '@/components/atoms/BannerPlaceholder'
import { useFeedStore } from '@/lib/stores/feed.store'

interface RecentMissionsProps {
  currentUserId: string
}

export default function RecentMissions({ currentUserId }: RecentMissionsProps) {
  const { missions, isLoading, fetchRecentMissions } = useFeedStore()

  useEffect(() => {
    fetchRecentMissions()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <BannerPlaceholder />

      <div className="flex items-center justify-between">
        <span className="font-heading text-xl font-black uppercase tracking-tight text-foreground">
          Recent Missions
        </span>
        <Link
          href="/missions"
          className="text-xs font-semibold text-primary hover:underline"
        >
          View all →
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-[16px]" />
          ))}
        </div>
      ) : missions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <p className="text-sm text-muted-foreground">
            No open missions yet.{' '}
            <Link href="/post" className="text-primary hover:underline">
              Post the first one.
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {missions.map((mission) => (
            <BountyCard
              key={mission.id}
              id={mission.id}
              category={mission.category}
              difficulty={mission.difficulty.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD'}
              title={mission.title}
              description={mission.description}
              xp={mission.reward_credits}
              adaReward={mission.ada_reward ? mission.ada_reward : undefined}
              maxClaimers={mission.max_claimers}
              approvedClaimers={mission.approved_claimers}
              rewardPerClaimer={mission.reward_per_claimer}
              deadline={mission.deadline}
              proofType={mission.proof_type}
              currentUserId={currentUserId}
              createdBy={mission.created_by}
              taskStatus={mission.status}
              shareable
            />
          ))}
        </div>
      )}
    </div>
  )
}
