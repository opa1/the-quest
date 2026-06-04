'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { CategoryBadge } from '@/components/atoms/CategoryBadge'
import { DifficultyBadge } from '@/components/atoms/DifficultyBadge'
import { AdaReward } from '@/components/atoms/AdaReward'
import { XPReward } from '@/components/atoms/XPReward'
import type { LandingMission } from '@/lib/stores/landing.store'

interface LandingMissionCardProps {
  mission: LandingMission
}

export function LandingMissionCard({ mission }: LandingMissionCardProps) {
  return (
    <Card className="flex h-full cursor-pointer flex-col gap-4 rounded-[16px] border border-border bg-card p-6 transition-colors duration-200 hover:border-primary/50">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CategoryBadge label={mission.category} />
        <DifficultyBadge difficulty={mission.difficulty.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD'} />
      </div>

      <h3 className="line-clamp-2 text-lg leading-snug font-bold text-foreground">
        {mission.title}
      </h3>

      <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {mission.description}
      </p>

      <Separator className="my-1 bg-border/50" />

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          {mission.ada_reward > 0 && <AdaReward lovelace={mission.ada_reward} />}
          {mission.reward_credits > 0 && <XPReward xp={mission.reward_credits} />}
        </div>

        <Button
          variant="outline"
          size="sm"
          asChild
          className="mt-1 w-full border-primary/50 text-primary hover:border-primary hover:text-primary"
        >
          <Link href={`/tasks/${mission.id}`}>
            <span className="text-xs font-bold tracking-widest uppercase">VIEW MISSION</span>
          </Link>
        </Button>
      </div>
    </Card>
  )
}
