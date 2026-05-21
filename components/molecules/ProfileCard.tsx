'use client'

import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import Link from 'next/link'
import UserAvatar from '@/components/atoms/UserAvatar'
import { ChainStatRow } from '@/components/atoms/ChainStatRow'
import { truncateAddress } from '@/lib/utils/rank'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import type { UserProfile } from '@/lib/types/missions'

interface ProfileCardProps {
  profile: UserProfile
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const { profileCard } = QUEST_CONFIG.record

  return (
    <Card className="bg-card border-border/50 rounded-[16px] p-6 flex flex-col gap-5">

      {/* Avatar + username */}
      <div className="flex flex-col items-center gap-3">
        <UserAvatar
          src={profile.avatar_url}
          username={profile.username ?? 'Unknown'}
          size="md"
        />
        <div className="text-center">
          <p className="text-base font-bold text-foreground">@{profile.username}</p>
          {profile.x_handle && (
            <a
              href={`https://x.com/${profile.x_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              @{profile.x_handle} on X
            </a>
          )}
        </div>
      </div>

      <Separator />

      {/* Member since */}
      <ChainStatRow
        label={profileCard.memberSince}
        value={new Date(profile.created_at).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })}
      />

      <Separator />

      {/* Wallet section */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
          {profileCard.walletLabel}
        </span>
        {profile.wallet_address ? (
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-foreground">
              {truncateAddress(profile.wallet_address)}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(profile.wallet_address!)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Copy wallet address"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground italic">
              {profileCard.walletUnlinked}
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link href={profileCard.linkWalletHref}>
                <span className="uppercase tracking-widest text-xs font-bold">
                  {profileCard.linkWalletLabel}
                </span>
              </Link>
            </Button>
          </div>
        )}
      </div>

    </Card>
  )
}
