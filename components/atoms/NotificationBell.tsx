import { Bell } from "lucide-react"

interface NotificationBellProps {
  unreadCount: number
}

export function NotificationBell({ unreadCount }: NotificationBellProps) {
  const displayCount = unreadCount > 9 ? "9+" : String(unreadCount)

  return (
    <div className="relative flex items-center justify-center">
      <Bell className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground sm:h-5 sm:w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-[3px] text-[10px] leading-none font-bold text-primary-foreground">
          {displayCount}
        </span>
      )}
    </div>
  )
}
