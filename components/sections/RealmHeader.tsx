"use client"

import Link from "next/link"
import RealmNavPills from "@/components/molecules/RealmNavPills"
import UserDropdown from "@/components/molecules/UserDropdown"
import CreditsDisplay from "@/components/atoms/CreditsDisplay"
import { NotificationDropdown } from "@/components/molecules/NotificationDropdown"
import { QuestLogo } from "../atoms/QuestLogo"

interface RealmHeaderProps {
  userId: string
  username: string
  avatarUrl: string | null
  credits: number
}

export default function RealmHeader({
  userId,
  username,
  avatarUrl,
  credits,
}: RealmHeaderProps) {
  return (
    <header className="fixed top-0 z-50 h-18 w-full border-b border-border/30 bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 md:px-10">
        <Link href="/realm">
          <QuestLogo className="[&_span.logo-name]:hidden sm:[&_span.logo-name]:block" />
        </Link>

        <RealmNavPills />

        <div className="flex items-center gap-4">
          <CreditsDisplay amount={credits} />
          <NotificationDropdown userId={userId} />
          <UserDropdown username={username} avatarUrl={avatarUrl} />
        </div>
      </div>
    </header>
  )
}
