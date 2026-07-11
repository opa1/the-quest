'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Mission } from '@/lib/types/missions'

interface FeedState {
  missions: Mission[]
  isLoading: boolean
  lastFetched: number | null
  fetchRecentMissions: () => Promise<void>
}

export const useFeedStore = create<FeedState>((set, get) => ({
  missions: [],
  isLoading: true,
  lastFetched: null,

  fetchRecentMissions: async () => {
    const { lastFetched } = get()
    const now = Date.now()
    if (lastFetched && now - lastFetched < 60_000) return

    set({ isLoading: true })
    const supabase = createClient()

    const { data } = await supabase
      .from('tasks')
      .select(`
        id, title, description, category, difficulty,
        reward_credits, ada_reward, max_claimers, reward_per_claimer, deadline,
        proof_type, status, created_at, created_by,
        profiles!tasks_created_by_fkey(username, avatar_url)
      `)
      .in('status', ['open', 'completed'])
      .order('created_at', { ascending: false })
      .limit(4)

    const missions = ((data as unknown as Mission[]) ?? [])

    // Approved claim counts drive the slot progress bars on multi-claimer cards
    const taskIds = missions.map((m) => m.id)
    if (taskIds.length > 0) {
      const { data: claimCounts } = await supabase
        .from('task_claims')
        .select('task_id')
        .in('task_id', taskIds)
        .eq('status', 'approved')

      const approvedMap: Record<string, number> = {}
      for (const row of claimCounts ?? []) {
        approvedMap[row.task_id] = (approvedMap[row.task_id] ?? 0) + 1
      }
      missions.forEach((m) => {
        m.approved_claimers = approvedMap[m.id] ?? 0
      })
    }

    set({ missions, isLoading: false, lastFetched: now })
  },
}))
