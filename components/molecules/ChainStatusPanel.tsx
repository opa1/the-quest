'use client'

import Link from 'next/link'
import { Link2, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ChainStatRow } from '@/components/atoms/ChainStatRow'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { useAda } from '@/lib/hooks/useAda'
import type { LedgerStats } from '@/lib/utils/ledger'

interface ChainStatusPanelProps {
  stats?: LedgerStats
  isLoading?: boolean
}

const { ctaLabel, ctaHref, statLabels } = QUEST_CONFIG.ledger.chainStatus

export function ChainStatusPanel({ stats, isLoading }: ChainStatusPanelProps) {
  const { network, formatAda } = useAda()
  const networkLabel = network === 'Mainnet' ? 'Cardano Mainnet' : 'Cardano Preprod'
  return (
    <Card className="flex flex-col gap-5 rounded-[16px] border border-border/50 bg-card p-6">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          CHAIN STATUS
        </span>
      </div>

      <Separator className="bg-border/50" />

      <ChainStatRow label="Network" value={networkLabel} />

      {isLoading ? (
        <>
          <div className="h-5 w-32 animate-pulse rounded bg-muted/30" />
          <div className="h-5 w-24 animate-pulse rounded bg-muted/30" />
          <div className="h-5 w-28 animate-pulse rounded bg-muted/30" />
        </>
      ) : (
        <>
          <ChainStatRow
            label={statLabels.totalXpAwarded}
            value={stats ? `${stats.totalXpAwarded.toLocaleString()} XP` : '-- XP'}
            valueHighlight
          />
          <ChainStatRow
            label={statLabels.openMissions}
            value={stats ? String(stats.openMissions) : '--'}
          />
          <ChainStatRow
            label={statLabels.totalAdaEarned}
            value={stats ? formatAda(stats.totalAdaEarned) : '--'}
          />
        </>
      )}

      <Separator className="bg-border/50" />

      <Button variant="outline" className="w-full" asChild>
        <Link href={ctaHref}>
          {ctaLabel}
          <ExternalLink className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </Card>
  )
}
