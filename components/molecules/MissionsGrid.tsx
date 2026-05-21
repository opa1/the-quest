'use client'

import { useEffect } from 'react'
import { useMissionsStore } from '@/lib/stores/missions.store'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import MissionsEmptyState from '@/components/atoms/MissionsEmptyState'
import { BountyCard } from '@/components/molecules/BountyCard'

export default function MissionsGrid() {
  const { missions, isLoading, hasMore, fetchMissions, loadMore } = useMissionsStore()

  useEffect(() => {
    fetchMissions(true)
  }, [])

  if (isLoading && missions.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[220px] rounded-[16px]" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {missions.map((mission) => (
          <BountyCard
            key={mission.id}
            id={mission.id}
            category={mission.category}
            difficulty={mission.difficulty as any}
            title={mission.title}
            description={mission.description}
            xp={mission.reward_credits}
            featured={false}
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
            <span className="uppercase tracking-widest text-sm font-bold">
              {isLoading ? 'LOADING...' : 'LOAD MORE MISSIONS'}
            </span>
          </Button>
        </div>
      )}

    </div>
  )
}
