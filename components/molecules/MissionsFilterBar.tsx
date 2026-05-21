"use client"

import { useMissionsStore } from "@/lib/stores/missions.store"
import { QUEST_CONFIG } from "@/lib/config/quest.config"
import FeedFilterTab from "@/components/atoms/FeedFilterTab"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"

export default function MissionsFilterBar() {
  const { filters, setFilter } = useMissionsStore()

  return (
    <div className="flex flex-col gap-4">
      {/* Category chips */}
      <div className="flex">
        <ScrollArea className="w-1 flex-1">
          <div className="flex items-center gap-2">
            {QUEST_CONFIG.missions.categories.map((cat) => (
              <FeedFilterTab
                key={cat.value}
                label={cat.label}
                value={cat.value as any}
                isActive={filters.category === cat.value}
                onClick={() => setFilter("category", cat.value as any)}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Difficulty chips + Sort dropdown row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Difficulty chips */}
        <div className="flex flex-1">
          <ScrollArea className="w-1 flex-1">
            <div className="flex items-center gap-2">
              {QUEST_CONFIG.missions.difficulties.map((diff) => (
                <FeedFilterTab
                  key={diff.value}
                  label={diff.label}
                  value={diff.value as any}
                  isActive={filters.difficulty === diff.value}
                  onClick={() => setFilter("difficulty", diff.value as any)}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Sort dropdown */}
        <Select
          value={filters.sort}
          onValueChange={(val) => setFilter("sort", val as any)}
        >
          <SelectTrigger className="h-9 w-40 text-xs tracking-widest uppercase">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-md">
            {QUEST_CONFIG.missions.sortOptions.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="text-xs tracking-widest uppercase p-3"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
