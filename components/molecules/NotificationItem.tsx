'use client'

import { useRouter } from 'next/navigation'
import { Sword, Coins, Bell } from 'lucide-react'
import TimeAgo from '@/components/atoms/TimeAgo'
import { cn } from '@/lib/utils'
import type { Notification } from '@/lib/types/notifications'

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
}

const categoryIcons = {
  mission: { Icon: Sword, className: 'text-amber-400' },
  reward:  { Icon: Coins, className: 'text-green-400' },
  system:  { Icon: Bell,  className: 'text-muted-foreground' },
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const router = useRouter()
  const { Icon, className } =
    categoryIcons[notification.category as keyof typeof categoryIcons] ??
    categoryIcons.system

  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id)
    }
    if (notification.action_url) {
      router.push(notification.action_url)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/20 cursor-pointer',
        notification.read ? 'bg-transparent' : 'bg-card/80'
      )}
    >
      {/* Category icon */}
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted/40">
        <Icon className={cn('h-3.5 w-3.5', className)} />
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-semibold leading-snug text-foreground">
          {notification.title}
        </span>
        <span className="line-clamp-2 text-xs leading-snug text-muted-foreground">
          {notification.message}
        </span>
        <TimeAgo date={notification.created_at} className="mt-0.5 text-[11px]" />
      </div>

      {/* Unread dot */}
      {!notification.read && (
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      )}
    </button>
  )
}
