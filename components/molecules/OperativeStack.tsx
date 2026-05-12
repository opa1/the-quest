'use client'

import { useState } from 'react'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { OperativeBadge } from '@/components/atoms/OperativeBadge'

type Card = {
  id: string
  name: string
  image: string
  featured: boolean
  rank?: string
  tags?: readonly string[]
}

export function OperativeStack() {
  const featured = QUEST_CONFIG.operatives.find((o) => o.featured)!
  const others = QUEST_CONFIG.operatives.filter((o) => !o.featured)
  // Display order left → right: Murphy, Amanda, Patricia (featured = rightmost = default open)
  const cards = [...[...others].reverse(), featured] as Card[]
  const defaultIdx = cards.length - 1

  const [expandedIdx, setExpandedIdx] = useState(defaultIdx)

  return (
    <div
      className="flex h-90 w-full gap-2 md:h-105 lg:h-full"
      onMouseLeave={() => setExpandedIdx(defaultIdx)}
    >
      {cards.map((op, i) => {
        const isExpanded = expandedIdx === i
        const tags = 'tags' in op ? op.tags : undefined
        const rank = 'rank' in op ? op.rank : undefined

        return (
          <div
            key={op.id}
            onMouseEnter={() => setExpandedIdx(i)}
            className="relative min-w-15 cursor-pointer overflow-hidden rounded-2xl border border-white/10"
            style={{
              flexGrow: isExpanded ? 5 : 2,
              flexShrink: 1,
              flexBasis: 0,
              transition: 'flex-grow 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Background image — grayscale when collapsed */}
            <img
              src={op.image}
              alt={op.name}
              className="absolute inset-0 h-full w-full object-cover object-top"
              style={{
                filter: isExpanded ? 'grayscale(0%)' : 'grayscale(100%)',
                transition: 'filter 0.55s ease-in-out',
              }}
            />

            {/* Bottom gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />

            {/* Collapsed: vertical name reads bottom → top */}
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              style={{
                opacity: isExpanded ? 0 : 1,
                transition: 'opacity 0.25s ease-in-out',
              }}
            >
              <span
                className="whitespace-nowrap text-sm md:text-base font-bold uppercase tracking-widest text-primary"
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                }}
              >
                {op.name}
              </span>
            </div>

            {/* Expanded: tags + name + rank slide up from bottom */}
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 p-5"
              style={{
                opacity: isExpanded ? 1 : 0,
                transform: isExpanded ? 'translateY(0)' : 'translateY(10px)',
                transition: isExpanded
                  ? 'opacity 0.35s ease-in-out 0.2s, transform 0.35s ease-in-out 0.2s'
                  : 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
              }}
            >
              {tags && tags.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <OperativeBadge key={tag} label={tag} />
                  ))}
                </div>
              )}
              <p className="font-heading text-xl md:text-2xl font-bold uppercase text-white">
                {op.name}
              </p>
              {rank && (
                <p className="mt-1 text-xs md:text-sm text-muted-foreground">{rank}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
