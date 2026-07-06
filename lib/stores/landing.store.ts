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
  max_claimers?: number
  approved_claimers?: number
  deadline?: string | null
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
      .select('id, title, description, category, difficulty, reward_credits, ada_reward, max_claimers, deadline, proof_type, status, created_at')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(6)

    const missions = (data ?? []) as LandingMission[]

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

    set({
      missions,
      isLoading: false,
      lastFetched: now,
    })
  },
}))
