"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import UserAvatar from "@/components/atoms/UserAvatar"
import TimeAgo from "@/components/atoms/TimeAgo"
import { createClient } from "@/lib/supabase/client"
import { fetchRealmActivity, type ActivityEvent } from "@/lib/utils/activity"

export default function RealmActivityLog() {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRealmActivity().then((data) => {
      setEvents(data)
      setIsLoading(false)
    })

    const supabase = createClient()
    const channel = supabase
      .channel("realm-activity-log")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "task_logs" },
        async (payload) => {
          const log = payload.new as Record<string, unknown>
          if (!["claimed", "completed"].includes(log.action as string)) return
          const data = await fetchRealmActivity()
          setEvents(data)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <Card className="flex flex-col gap-4 rounded-[16px] border-border/40 bg-card p-5">
      <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
        Realm Activity
      </span>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-[10px]" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No activity yet. Be the first to claim a mission.
        </p>
      ) : (
        <div className="flex max-h-100 flex-col gap-3 overflow-y-auto">
          {events.slice(0, 6).map((event) => (
            <div key={event.id} className="flex items-start gap-3">
              <UserAvatar
                src={event.actor_avatar}
                username={event.actor_username}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-snug text-foreground">
                  <span className="font-semibold">@{event.actor_username}</span>{" "}
                  <span className="text-muted-foreground">
                    {event.action === "claimed" ? "claimed" : "completed"}
                  </span>
                </p>
                <Link
                  href={`/tasks/${event.task_id}`}
                  className="block truncate text-xs text-primary hover:underline"
                >
                  {event.task_title}
                </Link>
                <TimeAgo date={event.created_at} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
