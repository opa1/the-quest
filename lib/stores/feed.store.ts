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
        reward_credits, ada_reward, proof_type, status, created_at, created_by,
        profiles!tasks_created_by_fkey(username, avatar_url)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(4)

    set({ missions: (data as unknown as Mission[]) ?? [], isLoading: false, lastFetched: now })
  },
}))
