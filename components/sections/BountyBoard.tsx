'use client'

import { useEffect } from 'react'
import { ChapterLabel } from '@/components/atoms/ChapterLabel'
import { GuardedLink } from '@/components/atoms/GuardedLink'
import { SectionTitle } from '@/components/atoms/SectionTitle'
import { ScrollReveal } from '@/components/atoms/ScrollReveal'
import { SectionWrapper } from '@/components/atoms/SectionWrapper'
import { BountyCard } from '@/components/molecules/BountyCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { useLandingStore } from '@/lib/stores/landing.store'

export function BountyBoard() {
  const { chapterLabel, title, subtext, ctaLabel } = QUEST_CONFIG.bountyBoard
  const { missions, isLoading, fetchMissions } = useLandingStore()

  useEffect(() => {
    fetchMissions()
  }, [])

  return (
    <SectionWrapper id="bounty-board" className="bg-background" innerClassName="flex flex-col gap-12">
      <ScrollReveal className="flex flex-col items-center gap-4 text-center">
        <ChapterLabel label={chapterLabel} />
        <SectionTitle title={title} subtext={subtext} />
      </ScrollReveal>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-[16px]" />
          ))
        ) : missions.length > 0 ? (
          missions.map((mission, i) => (
            <ScrollReveal key={mission.id} delay={i * 75}>
              <BountyCard
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
                deadlinePassed={mission.deadline_passed}
                proofType={mission.proof_type}
                createdBy={mission.created_by}
                taskStatus={mission.status}
              />
            </ScrollReveal>
          ))
        ) : (
          <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
            No missions on the board yet.{' '}
            <GuardedLink href="/post" className="text-primary hover:underline">
              Post the first one.
            </GuardedLink>
          </p>
        )}
      </div>

      <ScrollReveal delay={500} className="flex justify-center">
        <Button variant="outline" asChild>
          <GuardedLink href="/missions">
            <span className="uppercase tracking-widest">{ctaLabel}</span>
          </GuardedLink>
        </Button>
      </ScrollReveal>
    </SectionWrapper>
  )
}
