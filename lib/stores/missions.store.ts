'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Mission, MissionFilters } from '@/lib/types/missions'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

interface MissionsState {
  missions: Mission[]
  filters: MissionFilters
  isLoading: boolean
  hasMore: boolean
  page: number
  lastFetched: number | null

  setFilter: <K extends keyof MissionFilters>(key: K, value: MissionFilters[K]) => void
  fetchMissions: (reset?: boolean) => Promise<void>
  loadMore: () => Promise<void>
}

const defaultFilters: MissionFilters = {
  category: 'ALL',
  difficulty: 'ALL',
  sort: 'newest',
}

export const useMissionsStore = create<MissionsState>((set, get) => ({
  missions: [],
  filters: defaultFilters,
  isLoading: false,
  hasMore: true,
  page: 0,
  lastFetched: null,

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      missions: [],
      page: 0,
      hasMore: true,
      lastFetched: null,
    }))
    get().fetchMissions(true)
  },

  fetchMissions: async (reset = false) => {
    const { filters, page, missions } = get()
    const supabase = createClient()
    const { pageSize } = QUEST_CONFIG.missions

    set({ isLoading: true })

    const currentPage = reset ? 0 : page
    const from = currentPage * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('tasks')
      .select('id, title, description, category, difficulty, reward_credits, ada_reward, proof_type, status, created_by, created_at, profiles!tasks_created_by_fkey(username, avatar_url)')
      .eq('status', 'open')
      .range(from, to)

    if (filters.category !== 'ALL') {
      query = query.eq('category', filters.category)
    }

    if (filters.difficulty !== 'ALL') {
      query = query.eq('difficulty', filters.difficulty)
    }

    if (filters.sort === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else if (filters.sort === 'oldest') {
      query = query.order('created_at', { ascending: true })
    } else if (filters.sort === 'reward') {
      query = query.order('reward_credits', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch missions:', error.message)
      set({ isLoading: false })
      return
    }

    const newMissions = (data ?? []) as unknown as Mission[]

    set({
      missions: reset ? newMissions : [...missions, ...newMissions],
      page: currentPage + 1,
      hasMore: newMissions.length === pageSize,
      isLoading: false,
      lastFetched: Date.now(),
    })
  },

  loadMore: async () => {
    await get().fetchMissions(false)
  },
}))
