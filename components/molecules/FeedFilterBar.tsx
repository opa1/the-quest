'use client'

import FeedFilterTab from '@/components/atoms/FeedFilterTab'
import { useFeedStore } from '@/lib/stores/feed.store'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import type { FeedFilter } from '@/lib/types/feed'

export default function FeedFilterBar() {
  const { filter, setFilter } = useFeedStore()

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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
  )
}
