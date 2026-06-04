'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

export type LandingMission = {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  reward_credits: number
  ada_reward: number
  proof_type: string
  status: string
  created_at: string
}

interface LandingState {
  missions: LandingMission[]
  isLoading: boolean
  lastFetched: number | null
  fetchMissions: () => Promise<void>
}

export const useLandingStore = create<LandingState>((set, get) => ({
  missions: [],
  isLoading: true,
  lastFetched: null,

  fetchMissions: async () => {
    const { lastFetched } = get()
    const now = Date.now()
    if (lastFetched && now - lastFetched < 60_000) return

    set({ isLoading: true })
    const supabase = createClient()

    const { data } = await supabase
      .from('tasks')
      .select('id, title, description, category, difficulty, reward_credits, ada_reward, proof_type, status, created_at')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(6)

    set({
      missions: data ?? [],
      isLoading: false,
      lastFetched: now,
    })
  },
}))
