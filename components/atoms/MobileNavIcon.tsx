import Link from 'next/link'
import {
  Home, Sword, ScrollText, Trophy,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const iconMap: Record<string, LucideIcon> = {
  Home, Sword, ScrollText, Trophy,
}

interface MobileNavIconProps {
  href: string
  iconName: string
  label: string
  isActive: boolean
}

export default function MobileNavIcon({ href, iconName, label, isActive }: MobileNavIconProps) {
  const Icon = iconMap[iconName] ?? Home

  return (
    <Link href={href} aria-label={label} className="relative flex items-center justify-center w-12 h-12">
      <Icon className={cn(
        'w-5 h-5 transition-colors duration-200',
        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      )} />
      {isActive && (
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
      )}
    </Link>
  )
}
