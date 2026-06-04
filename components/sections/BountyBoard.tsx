'use client'

import { useEffect } from 'react'
import { ChapterLabel } from '@/components/atoms/ChapterLabel'
import { SectionTitle } from '@/components/atoms/SectionTitle'
import { ScrollReveal } from '@/components/atoms/ScrollReveal'
import { SectionWrapper } from '@/components/atoms/SectionWrapper'
import { BountyCard } from '@/components/molecules/BountyCard'
import { LandingMissionCard } from '@/components/molecules/LandingMissionCard'
import { LandingMissionCardSkeleton } from '@/components/molecules/LandingMissionCardSkeleton'
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
            <LandingMissionCardSkeleton key={i} />
          ))
        ) : missions.length > 0 ? (
          missions.map((mission) => (
            <ScrollReveal key={mission.id}>
              <LandingMissionCard mission={mission} />
            </ScrollReveal>
          ))
        ) : (
          QUEST_CONFIG.bounties.map((bounty, i) => (
            <ScrollReveal key={bounty.id} delay={i * 75}>
              <BountyCard {...bounty} />
            </ScrollReveal>
          ))
        )}
      </div>

      <ScrollReveal delay={500} className="flex justify-center">
        <Button variant="outline">
          <span className="uppercase tracking-widest">{ctaLabel}</span>
        </Button>
      </ScrollReveal>
    </SectionWrapper>
  )
}
