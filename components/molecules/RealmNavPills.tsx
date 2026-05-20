'use client'

import { usePathname } from 'next/navigation'
import NavPill from '@/components/atoms/NavPill'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export default function RealmNavPills() {
  const pathname = usePathname()

  return (
    <nav className="hidden lg:flex items-center gap-2">
      {QUEST_CONFIG.realmNav.map((item) => (
        <NavPill
          key={item.href}
          label={item.label}
          href={item.href}
          iconName={item.icon}
          isActive={pathname === item.href}
        />
      ))}
    </nav>
  )
}
