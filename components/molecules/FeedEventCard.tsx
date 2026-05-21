import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import UserAvatar from "@/components/atoms/UserAvatar"
import FeedEventLabel from "@/components/atoms/FeedEventLabel"
import TimeAgo from "@/components/atoms/TimeAgo"
import { CategoryBadge } from "@/components/atoms/CategoryBadge"
import { DifficultyBadge } from "@/components/atoms/DifficultyBadge"
import { XPReward } from "@/components/atoms/XPReward"
import { TxStatusBadge } from "@/components/atoms/TxStatusBadge"
import type { FeedEvent } from "@/lib/types/feed"
import { cn } from "@/lib/utils"

interface FeedEventCardProps {
  event: FeedEvent
  className?: string
}

export default function FeedEventCard({
  event,
  className,
}: FeedEventCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-4 rounded-[16px] border-border/40 bg-card p-5",
        "transition-colors duration-200 hover:border-primary/20",
        className
      )}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar
            src={event.actor_avatar}
            username={event.actor_username}
            size="sm"
          />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">
              @{event.actor_username}
            </span>
            <FeedEventLabel type={event.type} />
          </div>
        </div>
        <TimeAgo date={event.created_at} />
      </div>

      {/* Task info */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <CategoryBadge label={event.category} />
          <DifficultyBadge difficulty={event.difficulty} />
        </div>
        <p className="text-base leading-snug font-bold text-foreground">
          {event.task_title}
        </p>
      </div>

      {/* Bottom row — type-specific */}
      {event.type === "new_bounty" && (
        <div className="flex items-center justify-between">
          <XPReward xp={event.reward_credits} />
          <Button variant="outline" size="sm" asChild>
            <a href={`/tasks/${event.task_id}`}>
              <span className="text-xs tracking-widest uppercase">CLAIM</span>
            </a>
          </Button>
        </div>
      )}

      {event.type === "claimed" && (
        <p className="text-xs tracking-wider text-muted-foreground uppercase">
          Mission in progress
        </p>
      )}

      {event.type === "completed" && (
        <div className="flex items-center justify-between">
          <XPReward xp={event.reward_credits} />
          <div className="flex items-center gap-2">
            {event.cardano_tx_hash && (
              <a
                href={`https://cardanoscan.io/transaction/${event.cardano_tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-primary underline underline-offset-2"
              >
                {event.cardano_tx_hash.slice(0, 8)}...
              </a>
            )}
            <TxStatusBadge status="CONFIRMED" />
          </div>
        </div>
      )}
    </Card>
  )
}
