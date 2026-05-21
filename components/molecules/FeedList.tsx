"use client"

import { useEffect } from "react"
import { useFeedStore } from "@/lib/stores/feed.store"
import FeedEventCard from "@/components/molecules/FeedEventCard"
import { Skeleton } from "@/components/ui/skeleton"
import { QUEST_CONFIG } from "@/lib/config/quest.config"

export default function FeedList() {
  const { events, filter, isLoading, fetchInitialFeed, subscribeToFeed } =
    useFeedStore()

  useEffect(() => {
    fetchInitialFeed()
    const unsubscribe = subscribeToFeed()
    return unsubscribe
  }, [])

  const filtered = events.filter((event) => {
    if (filter === "ALL") return true
    if (filter === "BOUNTIES") return event.type === "new_bounty"
    if (filter === "CLAIMED") return event.type === "claimed"
    if (filter === "COMPLETED") return event.type === "completed"
    return true
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-[16px]" />
        ))}
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-lg font-bold text-foreground">
          {QUEST_CONFIG.realm.feedEmptyState.title}
        </p>
        <p className="text-sm text-muted-foreground">
          {QUEST_CONFIG.realm.feedEmptyState.subtext}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {filtered.map((event) => (
        <FeedEventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
