"use client"

import FeedFilterTab from "@/components/atoms/FeedFilterTab"
import { useFeedStore } from "@/lib/stores/feed.store"
import { QUEST_CONFIG } from "@/lib/config/quest.config"
import type { FeedFilter } from "@/lib/types/feed"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"

export default function FeedFilterBar() {
  const { filter, setFilter } = useFeedStore()

  return (
    <div className="flex">
      <ScrollArea className="w-1 flex-1">
        <div className="flex gap-2 items-center overflow-x-auto pb-2">
          {QUEST_CONFIG.realm.feedFilters.map((tab) => (
            <FeedFilterTab
              key={tab.value}
              label={tab.label}
              value={tab.value as FeedFilter}
              isActive={filter === tab.value}
              onClick={() => setFilter(tab.value as FeedFilter)}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
