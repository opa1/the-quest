'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { ChapterLabel } from '@/components/atoms/ChapterLabel'
import { SectionTitle } from '@/components/atoms/SectionTitle'
import { ScrollReveal } from '@/components/atoms/ScrollReveal'
import { SectionWrapper } from '@/components/atoms/SectionWrapper'
import { TimelineDot } from '@/components/atoms/TimelineDot'
import { ChainStatusPanel } from '@/components/molecules/ChainStatusPanel'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { CARDANO_NETWORK } from '@/lib/config/cardano.config'
import { fetchLedgerTransactions, fetchLedgerStats } from '@/lib/utils/ledger'
import type { LedgerTransaction, LedgerStats } from '@/lib/utils/ledger'

const explorerBase =
  CARDANO_NETWORK === 'Mainnet'
    ? 'https://cardanoscan.io/transaction'
    : 'https://preprod.cardanoscan.io/transaction'

function truncateHash(hash: string): string {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`
}

function TxCard({ tx }: { tx: LedgerTransaction }) {
  const isConfirmed = tx.status === 'confirmed'
  return (
    <Card className="flex flex-col gap-3 rounded-[14px] border border-border/50 bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-base font-bold text-foreground line-clamp-1">{tx.task_title}</span>
          <span className="text-xs text-muted-foreground">
            by @{tx.completed_by} &middot; {tx.category}
          </span>
        </div>
        {isConfirmed ? (
          <Badge variant="outline" className="flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-green-400">CONFIRMED</span>
          </Badge>
        ) : (
          <Badge variant="outline" className="flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-amber-400">PENDING</span>
          </Badge>
        )}
      </div>

      {isConfirmed && tx.cardano_tx_hash && (
        <Link
          href={`${explorerBase}/${tx.cardano_tx_hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-[8px] border border-border/40 bg-background/60 px-3 py-2 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="break-all">{truncateHash(tx.cardano_tx_hash)}</span>
          <ExternalLink className="h-3 w-3 shrink-0" />
        </Link>
      )}
    </Card>
  )
}

function TxCardSkeleton() {
  return (
    <Card className="flex flex-col gap-3 rounded-[14px] border border-border/50 bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted/30" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted/30" />
        </div>
        <div className="h-6 w-24 animate-pulse rounded-full bg-muted/30 shrink-0" />
      </div>
      <div className="h-8 w-full animate-pulse rounded-[8px] bg-muted/30" />
    </Card>
  )
}

export function TheLedger() {
  const { chapterLabel, title, subtext } = QUEST_CONFIG.ledger
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([])
  const [stats, setStats] = useState<LedgerStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchLedgerTransactions(2), fetchLedgerStats()]).then(
      ([txs, st]) => {
        setTransactions(txs)
        setStats(st)
        setIsLoading(false)
      }
    )
  }, [])

  return (
    <SectionWrapper id="the-ledger" className="bg-background" innerClassName="flex flex-col gap-12">
      <ScrollReveal className="flex flex-col items-center gap-4 text-center">
        <ChapterLabel label={chapterLabel} />
        <SectionTitle title={title} subtext={subtext} />
      </ScrollReveal>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-6">
          {isLoading ? (
            <>
              <div className="flex items-start gap-4">
                <TimelineDot className="mt-5 shrink-0 hidden md:block" />
                <div className="flex-1"><TxCardSkeleton /></div>
              </div>
              <div className="flex items-start gap-4">
                <TimelineDot className="mt-5 shrink-0 hidden md:block" />
                <div className="flex-1"><TxCardSkeleton /></div>
              </div>
            </>
          ) : transactions.length > 0 ? (
            transactions.map((tx, i) => (
              <ScrollReveal key={tx.id} direction="left" delay={i * 120}>
                <div className="flex items-start gap-4">
                  <TimelineDot className="mt-5 shrink-0 hidden md:block" />
                  <div className="flex-1"><TxCard tx={tx} /></div>
                </div>
              </ScrollReveal>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No completed missions recorded yet. Be the first to finish one.
            </p>
          )}
        </div>

        <ScrollReveal direction="right" delay={150}>
          <ChainStatusPanel stats={stats ?? undefined} isLoading={isLoading} />
        </ScrollReveal>
      </div>
    </SectionWrapper>
  )
}
