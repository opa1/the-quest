'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Mission } from '@/lib/types/missions'
import { attachClaimCounts } from '@/lib/utils/claim-counts'

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
      // No status filter: the feed shows the 4 most recent missions whatever
      // state they are in. BountyCard badges in-flight and closed ones.
      .order('created_at', { ascending: false })
      .limit(4)

    const missions = ((data as unknown as Mission[]) ?? [])

    missions.forEach((m) => {
      m.deadline_passed = !!m.deadline && new Date(m.deadline).getTime() < now
    })

    await attachClaimCounts(supabase, missions)

    set({ missions, isLoading: false, lastFetched: now })
  },
}))
