"use client"

import { useMissionsStore } from "@/lib/stores/missions.store"
import { QUEST_CONFIG } from "@/lib/config/quest.config"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function MissionsFilterBar() {
  const { filters, setFilter } = useMissionsStore()

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* View */}
      <Select
        value={filters.viewMode}
        onValueChange={(val) => setFilter("viewMode", val as any)}
      >
        <SelectTrigger className="h-9 w-48 text-xs tracking-widest uppercase">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {QUEST_CONFIG.missions.viewOptions.map((opt) => (
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

      {/* Category */}
      <Select
        value={filters.category}
        onValueChange={(val) => setFilter("category", val as any)}
      >
        <SelectTrigger className="h-9 w-40 text-xs tracking-widest uppercase">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {QUEST_CONFIG.missions.categories.map((cat) => (
            <SelectItem
              key={cat.value}
              value={cat.value}
              className="text-xs tracking-widest uppercase p-3"
            >
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Difficulty */}
      <Select
        value={filters.difficulty}
        onValueChange={(val) => setFilter("difficulty", val as any)}
      >
        <SelectTrigger className="h-9 w-36 text-xs tracking-widest uppercase">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {QUEST_CONFIG.missions.difficulties.map((diff) => (
            <SelectItem
              key={diff.value}
              value={diff.value}
              className="text-xs tracking-widest uppercase p-3"
            >
              {diff.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select
        value={filters.sort}
        onValueChange={(val) => setFilter("sort", val as any)}
      >
        <SelectTrigger className="h-9 w-44 text-xs tracking-widest uppercase">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
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

      {/* Status (completed missions) */}
      <Select
        value={filters.status}
        onValueChange={(val) => setFilter("status", val as any)}
      >
        <SelectTrigger className="h-9 w-40 text-xs tracking-widest uppercase">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {QUEST_CONFIG.missions.statusOptions.map((opt) => (
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
  )
}
