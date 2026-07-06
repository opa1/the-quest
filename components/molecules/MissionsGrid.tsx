"use client"

import { useEffect } from "react"
import { useMissionsStore } from "@/lib/stores/missions.store"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import MissionsEmptyState from "@/components/atoms/MissionsEmptyState"
import { BountyCard } from "@/components/molecules/BountyCard"

interface MissionsGridProps {
  currentUserId?: string
}

export default function MissionsGrid({ currentUserId }: MissionsGridProps) {
  const { missions, isLoading, hasMore, fetchMissions, loadMore } =
    useMissionsStore()

  useEffect(() => {
    fetchMissions(true)
  }, [])

  if (isLoading && missions.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-55 rounded-[16px]" />
        ))}
      </div>
    )
  }

  if (!isLoading && missions.length === 0) {
    return <MissionsEmptyState />
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {missions.map((mission) => (
          <BountyCard
            key={mission.id}
            id={mission.id}
            category={mission.category}
            difficulty={mission.difficulty as any}
            title={mission.title}
            description={mission.description}
            xp={mission.reward_credits}
            adaReward={mission.ada_reward}
            maxClaimers={mission.max_claimers}
            rewardPerClaimer={mission.reward_per_claimer}
            deadline={mission.deadline}
            proofType={mission.proof_type}
            taskStatus={mission.status}
            createdBy={mission.created_by}
            currentUserId={currentUserId}
            featured={false}
            shareable
          />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMore}
            disabled={isLoading}
          >
            <span className="text-sm font-bold tracking-widest uppercase">
              {isLoading ? "LOADING..." : "LOAD MORE MISSIONS"}
            </span>
          </Button>
        </div>
      )}
    </div>
  )
}
