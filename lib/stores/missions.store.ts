"use client"

import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"
import type { Mission, MissionFilters } from "@/lib/types/missions"
import { attachClaimCounts } from "@/lib/utils/claim-counts"
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

// Postgres can't rank an enum-ish text column for us without a CASE expression,
// which PostgREST won't take, so "Open First" is applied here instead. Ranks
// unknown statuses last. Array.prototype.sort is stable, so the chosen sort
// (newest / oldest / reward) still holds within each group.
const STATUS_RANK: Record<string, number> = {
  open: 0,
  claimed: 1,
  submitted: 2,
  completed: 3,
  cancelled: 4,
}

function sortOpenFirst(missions: Mission[]): Mission[] {
  return [...missions].sort(
    (a, b) => (STATUS_RANK[a.status] ?? 99) - (STATUS_RANK[b.status] ?? 99)
  )
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
      // The only view that hides anything, and only on request.
      query = query.eq("status", "open")
    }
    // Otherwise no status filter at all. A mission is never dropped from the
    // board: claimed and submitted ones are in flight, completed/cancelled ones
    // are closed, and BountyCard badges each accordingly. (Open First reorders
    // them below rather than filtering them out.)


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

    const now = Date.now()
    newMissions.forEach((m) => {
      m.deadline_passed = !!m.deadline && new Date(m.deadline).getTime() < now
    })

    await attachClaimCounts(supabase, newMissions)

    const merged = reset ? newMissions : [...missions, ...newMissions]

    set({
      missions:
        filters.status === "OPEN_FIRST" ? sortOpenFirst(merged) : merged,
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
