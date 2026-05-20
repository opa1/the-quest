'use client'

import Link from 'next/link'
import RealmNavPills from '@/components/molecules/RealmNavPills'
import UserDropdown from '@/components/molecules/UserDropdown'
import CreditsDisplay from '@/components/atoms/CreditsDisplay'

interface RealmHeaderProps {
  username: string
  avatarUrl: string | null
  credits: number
}

export default function RealmHeader({ username, avatarUrl, credits }: RealmHeaderProps) {
  return (
    <header className="h-18 w-full fixed top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/30">
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-full flex items-center justify-between">
        <Link href="/realm">
          <span className="text-xl font-black uppercase tracking-widest text-primary font-heading">
            THE QUEST
          </span>
        </Link>

        <RealmNavPills />

        <div className="flex items-center gap-4">
          <CreditsDisplay amount={credits} />
          <UserDropdown username={username} avatarUrl={avatarUrl} />
        </div>
      </div>
    </header>
  )
}
