import Link from 'next/link'
import {
  Home, Sword, Plus, ScrollText, Trophy,
  User, Settings, LogOut,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const iconMap: Record<string, LucideIcon> = {
  Home, Sword, Plus, ScrollText, Trophy, User, Settings, LogOut,
}

interface NavPillProps {
  label: string
  href: string
  iconName: string
  isActive: boolean
  className?: string
}

export default function NavPill({ label, href, iconName, isActive, className }: NavPillProps) {
  const Icon = iconMap[iconName] ?? Home

  return (
    <Link href={href}>
      <div
        className={cn(
          'flex items-center gap-2 px-5 py-2 rounded-full transition-all duration-200 cursor-pointer',
          'bg-muted/40 border border-border/40 text-muted-foreground hover:bg-primary/20 hover:text-foreground hover:border-primary/30',
          isActive && 'bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground',
          className
        )}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="text-sm font-semibold whitespace-nowrap">{label}</span>
      </div>
    </Link>
  )
}
