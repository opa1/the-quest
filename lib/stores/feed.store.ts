"use client"

import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"
import type { FeedEvent, FeedFilter } from "@/lib/types/feed"

interface FeedState {
  events: FeedEvent[]
  filter: FeedFilter
  isLoading: boolean
  lastFetched: number | null

  setFilter: (filter: FeedFilter) => void
  fetchInitialFeed: () => Promise<void>
  prependEvent: (event: FeedEvent) => void
  subscribeToFeed: () => () => void
}

export const useFeedStore = create<FeedState>((set, get) => ({
  events: [],
  filter: "ALL",
  isLoading: true,
  lastFetched: null,

  setFilter: (filter) => set({ filter }),

  prependEvent: (event) =>
    set((state) => ({ events: [event, ...state.events] })),

  fetchInitialFeed: async () => {
    const { lastFetched } = get()
    const now = Date.now()
    if (lastFetched && now - lastFetched < 60_000) return

    const supabase = createClient()

    const { data: logs } = await supabase
      .from("feed_events")
      .select("*")
      .in("action", ["claimed", "completed"])
      .order("created_at", { ascending: false })
      .limit(30)

    const { data: newTasks } = await supabase
      .from("tasks")
      .select(
        "id, title, category, difficulty, reward_credits, created_at, profiles!tasks_created_by_fkey(username, avatar_url)"
      )
      .order("created_at", { ascending: false })
      .limit(20)

    const logEvents: FeedEvent[] = (logs ?? []).map((log) => ({
      id: log.id,
      type: log.action === "claimed" ? "claimed" : "completed",
      created_at: log.created_at,
      task_id: log.task_id,
      task_title: log.task_title,
      category: log.category,
      difficulty: log.difficulty,
      reward_credits: log.reward_credits,
      actor_username: log.actor_username,
      actor_avatar: log.actor_avatar,
      poster_username: log.poster_username,
      cardano_tx_hash: log.cardano_tx_hash,
    }))

    const taskEvents: FeedEvent[] = (newTasks ?? []).map((task) => ({
      id: `task-${task.id}`,
      type: "new_bounty" as const,
      created_at: task.created_at,
      task_id: task.id,
      task_title: task.title,
      category: task.category,
      difficulty: task.difficulty,
      reward_credits: task.reward_credits,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      actor_username: (task.profiles as any)?.username ?? "Unknown",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      actor_avatar: (task.profiles as any)?.avatar_url ?? null,
      poster_username: null,
      cardano_tx_hash: null,
    }))

    const merged = [...logEvents, ...taskEvents].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    set({ events: merged, isLoading: false, lastFetched: now })
  },

  subscribeToFeed: () => {
    const supabase = createClient()

    const tasksChannel = supabase
      .channel("realm-tasks")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tasks" },
        (payload) => {
          const task = payload.new as Record<string, unknown>
          get().prependEvent({
            id: `task-${task.id}`,
            type: "new_bounty",
            created_at: task.created_at as string,
            task_id: task.id as string,
            task_title: task.title as string,
            category: task.category as string,
            difficulty: task.difficulty as FeedEvent["difficulty"],
            reward_credits: task.reward_credits as number,
            actor_username: "Unknown",
            actor_avatar: null,
            poster_username: null,
            cardano_tx_hash: null,
          })
        }
      )
      .subscribe()

    const logsChannel = supabase
      .channel("realm-logs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "task_logs" },
        async (payload) => {
          const log = payload.new as Record<string, unknown>
          if (!["claimed", "completed"].includes(log.action as string)) return

          const { data } = await supabase
            .from("feed_events")
            .select("*")
            .eq("id", log.id)
            .single()

          if (!data) return

          get().prependEvent({
            id: data.id,
            type: log.action === "claimed" ? "claimed" : "completed",
            created_at: data.created_at,
            task_id: data.task_id,
            task_title: data.task_title,
            category: data.category,
            difficulty: data.difficulty,
            reward_credits: data.reward_credits,
            actor_username: data.actor_username,
            actor_avatar: data.actor_avatar,
            poster_username: data.poster_username,
            cardano_tx_hash: data.cardano_tx_hash,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(tasksChannel)
      supabase.removeChannel(logsChannel)
    }
  },
}))
