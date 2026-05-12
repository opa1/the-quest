import React from 'react'
import { ChronicleCard } from '@/components/molecules/ChronicleCard'
import { TimelineDot } from '@/components/atoms/TimelineDot'
import { TimelineLabel } from '@/components/atoms/TimelineLabel'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

type ChronicleEntry = (typeof QUEST_CONFIG.chronicle.entries)[number]

interface ChronicleTimelineProps {
  entries: readonly ChronicleEntry[]
}

export function ChronicleTimeline({ entries }: ChronicleTimelineProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr]">
      {entries.map((entry) => (
        <React.Fragment key={entry.id}>
          {/* Left column */}
          <div className="flex items-center justify-end py-8 pr-8">
            {entry.side === 'left' && (
              <ChronicleCard
                id={entry.id}
                icon={entry.icon}
                category={entry.category}
                title={entry.title}
                description={entry.description}
              />
            )}
          </div>

          {/* Center column — vertical line + dot + label */}
          <div className="relative flex flex-col items-center">
            <div className="absolute bottom-0 left-1/2 top-0 z-0 w-px -translate-x-1/2 bg-border/40" />
            <div className="relative z-10 flex h-full items-center">
              <div className="flex items-center gap-3">
                {entry.side === 'right' && (
                  <TimelineLabel label={entry.timelineLabel} side="left" />
                )}
                <TimelineDot />
                {entry.side === 'left' && (
                  <TimelineLabel label={entry.timelineLabel} side="right" />
                )}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex items-center justify-start py-8 pl-8">
            {entry.side === 'right' && (
              <ChronicleCard
                id={entry.id}
                icon={entry.icon}
                category={entry.category}
                title={entry.title}
                description={entry.description}
              />
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}
