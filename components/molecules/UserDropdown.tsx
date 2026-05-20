'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Settings, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import UserAvatar from '@/components/atoms/UserAvatar'
import { useAuthStore } from '@/lib/stores/auth.store'

interface UserDropdownProps {
  username: string
  avatarUrl: string | null
}

export default function UserDropdown({ username, avatarUrl }: UserDropdownProps) {
  const { signOut } = useAuthStore()
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="outline-none cursor-pointer">
          <UserAvatar src={avatarUrl} username={username} size="sm" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 bg-card border-border/50 rounded-[12px]">
        <div className="px-3 py-2 border-b border-border/40">
          <p className="text-xs font-semibold text-foreground">@{username}</p>
        </div>

        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
            <User className="w-4 h-4" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
          onClick={async () => {
            await signOut()
            router.push('/')
          }}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
