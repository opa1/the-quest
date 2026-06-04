'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import TimeAgo from '@/components/atoms/TimeAgo'
import { formatAda } from '@/lib/utils/currency'
import { fetchLedgerTransactions } from '@/lib/utils/ledger'
import { CARDANO_NETWORK } from '@/lib/config/cardano.config'
import type { LedgerTransaction, LedgerStats } from '@/lib/utils/ledger'

const explorerBase =
  CARDANO_NETWORK === 'Mainnet'
    ? 'https://cardanoscan.io/transaction'
    : 'https://preprod.cardanoscan.io/transaction'

function truncateHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`
}

function StatusBadge({ status, hash }: { status: 'confirmed' | 'pending'; hash: string | null }) {
  if (status === 'confirmed') {
    return (
      <Badge variant="outline" className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <span className="text-green-400">CONFIRMED</span>
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
      <span className="h-2 w-2 rounded-full bg-amber-500" />
      <span className="text-amber-400">PENDING</span>
    </Badge>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="flex flex-col gap-1 rounded-[14px] border border-border/50 bg-card p-5">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="text-2xl font-black text-primary">{value}</span>
    </Card>
  )
}

function MissionCard({ tx }: { tx: LedgerTransaction }) {
  return (
    <Card className="flex flex-col gap-3 rounded-[14px] border border-border/50 bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <Link
            href={`/tasks/${tx.task_id}`}
            className="text-base font-bold text-foreground hover:text-primary transition-colors line-clamp-2"
          >
            {tx.task_title}
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>@{tx.completed_by}</span>
            <span>&middot;</span>
            <span className="uppercase tracking-wider">{tx.category}</span>
          </div>
        </div>
        <StatusBadge status={tx.status} hash={tx.cardano_tx_hash} />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex gap-4">
          {tx.ada_reward > 0 && (
            <span className="font-semibold text-primary">{formatAda(tx.ada_reward)}</span>
          )}
          {tx.reward_credits > 0 && (
            <span>+{tx.reward_credits.toLocaleString()} XP</span>
          )}
        </div>
        <TimeAgo date={tx.completed_at} />
      </div>

      {tx.status === 'confirmed' && tx.cardano_tx_hash && (
        <Link
          href={`${explorerBase}/${tx.cardano_tx_hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-[8px] border border-border/40 bg-background/60 px-3 py-2 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>{truncateHash(tx.cardano_tx_hash)}</span>
          <ExternalLink className="h-3 w-3 shrink-0" />
        </Link>
      )}
    </Card>
  )
}

interface LedgerPageContentProps {
  initialTransactions: LedgerTransaction[]
  initialStats: LedgerStats
  totalCount: number
}

export function LedgerPageContent({
  initialTransactions,
  initialStats,
  totalCount,
}: LedgerPageContentProps) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const hasMore = transactions.length < totalCount

  const loadMore = async () => {
    setIsLoadingMore(true)
    const more = await fetchLedgerTransactions(20, transactions.length)
    setTransactions((prev) => [...prev, ...more])
    setIsLoadingMore(false)
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-10">

      {/* Page header */}
      <div className="mb-10 flex flex-col gap-3">
        <h1 className="font-heading text-4xl font-black uppercase tracking-tight text-foreground md:text-5xl">
          THE LEDGER
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          A permanent public record of every mission completed on The Quest.
        </p>
      </div>

      {/* Stats strip */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total XP Awarded"
          value={`${initialStats.totalXpAwarded.toLocaleString()} XP`}
        />
        <StatCard label="Open Missions" value={String(initialStats.openMissions)} />
        <StatCard label={`Total ${initialStats.adaLabel} Earned`} value={formatAda(initialStats.totalAdaEarned)} />
      </div>

      {/* Empty state */}
      {transactions.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-muted-foreground">No completed missions yet. Be the first to claim one.</p>
          <Button variant="default" asChild>
            <Link href="/missions">
              <span className="text-sm font-bold uppercase tracking-widest">BROWSE MISSIONS</span>
            </Link>
          </Button>
        </div>
      )}

      {/* Desktop table */}
      {transactions.length > 0 && (
        <div className="hidden lg:block">
          <div className="overflow-hidden rounded-[16px] border border-border/50 bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left">
                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Mission</th>
                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Completed By</th>
                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Category</th>
                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">ADA Earned</th>
                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">XP</th>
                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr
                    key={tx.id}
                    className={i < transactions.length - 1 ? 'border-b border-border/30' : ''}
                  >
                    <td className="max-w-[240px] px-5 py-4">
                      <Link
                        href={`/tasks/${tx.task_id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                      >
                        {tx.task_title}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      @{tx.completed_by}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-primary">
                      {tx.ada_reward > 0 ? formatAda(tx.ada_reward) : '--'}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {tx.reward_credits > 0 ? `+${tx.reward_credits.toLocaleString()}` : '--'}
                    </td>
                    <td className="px-5 py-4">
                      {tx.status === 'confirmed' && tx.cardano_tx_hash ? (
                        <Link
                          href={`${explorerBase}/${tx.cardano_tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-green-400 hover:text-green-300 transition-colors"
                        >
                          <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                          <span className="text-[11px] font-semibold uppercase tracking-wider">CONFIRMED</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">PENDING</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <TimeAgo date={tx.completed_at} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile cards */}
      {transactions.length > 0 && (
        <div className="flex flex-col gap-4 lg:hidden">
          {transactions.map((tx) => (
            <MissionCard key={tx.id} tx={tx} />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="text-sm font-bold uppercase tracking-widest">Loading...</span>
              </>
            ) : (
              <span className="text-sm font-bold uppercase tracking-widest">LOAD MORE</span>
            )}
          </Button>
        </div>
      )}

    </div>
  )
}
