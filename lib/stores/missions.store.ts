"use client"

import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"
import type { Mission, MissionFilters } from "@/lib/types/missions"
import { QUEST_CONFIG } from "@/lib/config/quest.config"

interface MissionsState {
  missions: Mission[]
  filters: MissionFilters
  isLoading: boolean
  hasMore: boolean
  page: number
  lastFetched: number | null

  setFilter: <K extends keyof MissionFilters>(
    key: K,
    value: MissionFilters[K]
  ) => void
  fetchMissions: (reset?: boolean) => Promise<void>
  loadMore: () => Promise<void>
}

const defaultFilters: MissionFilters = {
  viewMode: "ALL",
  category: "ALL",
  difficulty: "ALL",
  sort: "newest",
  status: "ALL",
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
      .from("tasks")
      .select(
        "id, title, description, category, difficulty, reward_credits, ada_reward, max_claimers, reward_per_claimer, deadline, proof_type, status, created_by, created_at, profiles!tasks_created_by_fkey(username, avatar_url)"
      )
      .range(from, to)

    if (filters.viewMode === "MINE") {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        query = query.eq("created_by", user.id)
      }
    } else if (filters.status === "OPEN") {
      // Hide completed.
      query = query.eq("status", "open")
    } else {
      // Show open + completed (completed shown greyed with a green check).
      query = query.in("status", ["open", "completed"])
      if (filters.status === "OPEN_FIRST") {
        // 'open' > 'completed' alphabetically, so desc puts open at the top and
        // completed at the bottom, before the chosen sort applies within each.
        query = query.order("status", { ascending: false })
      }
    }


    if (filters.category !== "ALL") {
      query = query.eq("category", filters.category)
    }

    if (filters.difficulty !== "ALL") {
      query = query.eq("difficulty", filters.difficulty)
    }

    if (filters.sort === "newest") {
      query = query.order("created_at", { ascending: false })
    } else if (filters.sort === "oldest") {
      query = query.order("created_at", { ascending: true })
    } else if (filters.sort === "reward") {
      query = query.order("reward_credits", { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error("Failed to fetch missions:", error.message)
      set({ isLoading: false })
      return
    }

    const newMissions = (data ?? []) as unknown as Mission[]

    // Approved claim counts drive the slot progress bars on multi-claimer cards
    const taskIds = newMissions.map((m) => m.id)
    if (taskIds.length > 0) {
      const { data: claimCounts } = await supabase
        .from("task_claims")
        .select("task_id")
        .in("task_id", taskIds)
        .eq("status", "approved")

      const approvedMap: Record<string, number> = {}
      for (const row of claimCounts ?? []) {
        approvedMap[row.task_id] = (approvedMap[row.task_id] ?? 0) + 1
      }
      newMissions.forEach((m) => {
        m.approved_claimers = approvedMap[m.id] ?? 0
      })
    }

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
