"use client"

import { useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { NotificationBell } from "@/components/atoms/NotificationBell"
import { NotificationItem } from "@/components/molecules/NotificationItem"
import { useNotificationsStore } from "@/lib/stores/notifications.store"
import { QUEST_CONFIG } from "@/lib/config/quest.config"

interface NotificationDropdownProps {
  userId: string
}

const cfg = QUEST_CONFIG.notifications

function SkeletonRow() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-muted/40" />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted/30" />
        <div className="h-3 w-full animate-pulse rounded bg-muted/30" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted/30" />
      </div>
    </div>
  )
}

export function NotificationDropdown({ userId }: NotificationDropdownProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    subscribeToNotifications,
  } = useNotificationsStore()

  useEffect(() => {
    fetchNotifications()
    const unsubscribe = subscribeToNotifications(userId)
    return unsubscribe
  }, [userId])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group relative flex items-center justify-center rounded-md p-1.5 transition-colors hover:bg-muted/40"
          aria-label="Notifications"
        >
          <NotificationBell unreadCount={unreadCount} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 overflow-hidden rounded-[14px] border border-border/50 bg-card p-0 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {cfg.title}
          </span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-xs text-primary underline underline-offset-2 transition-opacity hover:opacity-70"
            >
              {cfg.markAllRead}
            </button>
          )}
        </div>

        <Separator className="bg-border/40" />

        {/* List */}
        <div className="max-h-100 overflow-y-auto">
          {isLoading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : notifications.length === 0 ? (
            <p className="py-10 text-center text-xs text-muted-foreground">
              {cfg.empty}
            </p>
          ) : (
            notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={markAsRead}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator className="bg-border/40" />
            <p className="py-2 text-center text-[11px] text-muted-foreground">
              {cfg.footer}
            </p>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
