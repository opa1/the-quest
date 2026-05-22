'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import LeaderboardTable from '@/components/molecules/LeaderboardTable'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import type { LeaderboardEntry } from '@/lib/types/missions'

interface LeaderboardFullTableProps {
  initialEntries: LeaderboardEntry[]
  currentUserId: string
  hasMore: boolean
}

export default function LeaderboardFullTable({
  initialEntries,
  currentUserId,
  hasMore: initialHasMore,
}: LeaderboardFullTableProps) {
  const [entries, setEntries] = useState(initialEntries)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)

  const loadMore = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { pageSize } = QUEST_CONFIG.leaderboard
    const from = page * pageSize + 3
    const to = from + pageSize - 1

    const { data } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, credits')
      .order('credits', { ascending: false })
      .range(from, to)

    const newEntries: LeaderboardEntry[] = (data ?? []).map((p, i) => ({
      rank: from + i + 1,
      id: p.id,
      username: p.username,
      avatar_url: p.avatar_url,
      credits: p.credits ?? 0,
      completed: 0,
      proofs: 0,
      isCurrentUser: p.id === currentUserId,
    }))

    setEntries((prev) => [...prev, ...newEntries])
    setHasMore(newEntries.length === pageSize)
    setPage((prev) => prev + 1)
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <LeaderboardTable entries={entries} currentUserId={currentUserId} />

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMore}
            disabled={isLoading}
          >
            <span className="uppercase tracking-widest text-sm font-bold">
              {isLoading ? 'LOADING...' : 'LOAD MORE'}
            </span>
          </Button>
        </div>
      )}
    </div>
  )
}
