'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { XPReward } from '@/components/atoms/XPReward'
import UserAvatar from '@/components/atoms/UserAvatar'
import TimeAgo from '@/components/atoms/TimeAgo'
import OnChainProofBlock from '@/components/atoms/OnChainProofBlock'
import { useAuthStore } from '@/lib/stores/auth.store'
import { claimTask, dropTask } from '@/app/actions/tasks'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { Loader2 } from 'lucide-react'

interface TaskActionPanelProps {
  taskId: string
  status: 'open' | 'claimed' | 'completed' | 'cancelled'
  createdById: string
  claimedById: string | null
  xp: number
  txHash: string | null
  completedAt: string | null
  claimedAt: string | null
  claimer: { username: string | null; avatar_url: string | null } | null
  poster: { username: string | null; avatar_url: string | null } | null
}

export default function TaskActionPanel({
  taskId, status, createdById, claimedById,
  xp, txHash, completedAt, claimedAt, claimer, poster,
}: TaskActionPanelProps) {
  const { user, openDialog } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { actions } = QUEST_CONFIG.taskDetail

  const isCreator = user?.id === createdById
  const isClaimer = user?.id === claimedById
  const isAuthenticated = !!user

  const handleClaim = async () => {
    if (!isAuthenticated) {
      openDialog(`/tasks/${taskId}`)
      return
    }
    setIsLoading(true)
    setError(null)
    const result = await claimTask(taskId)
    if (result.error) setError('Failed to claim mission. Try again.')
    setIsLoading(false)
  }

  const handleDrop = async () => {
    setIsLoading(true)
    setError(null)
    const result = await dropTask(taskId)
    if (result.error) setError('Failed to drop mission. Try again.')
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* XP Reward card */}
      <Card className="bg-card border-border/50 rounded-[16px] p-6 flex flex-col gap-4">
        <XPReward xp={xp} />

        <Separator />

        {/* OPEN — not logged in */}
        {status === 'open' && !isAuthenticated && (
          <Button variant="default" size="lg" className="w-full" onClick={handleClaim}>
            <span className="uppercase tracking-widest text-sm font-bold">
              {actions.loginPrompt}
            </span>
          </Button>
        )}

        {/* OPEN — logged in, not creator */}
        {status === 'open' && isAuthenticated && !isCreator && (
          <Button
            variant="default"
            size="lg"
            className="w-full"
            onClick={handleClaim}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            <span className="uppercase tracking-widest text-sm font-bold">
              {isLoading ? 'CLAIMING...' : actions.claim}
            </span>
          </Button>
        )}

        {/* OPEN — logged in, is creator */}
        {status === 'open' && isAuthenticated && isCreator && (
          <div className="text-xs uppercase tracking-widest text-muted-foreground text-center py-2">
            {actions.youPosted}
          </div>
        )}

        {/* CLAIMED — current user is claimer */}
        {status === 'claimed' && isClaimer && (
          <div className="flex flex-col gap-3">
            <Button variant="default" size="lg" className="w-full" asChild>
              <a href={`/tasks/${taskId}/submit`}>
                <span className="uppercase tracking-widest text-sm font-bold">
                  {actions.submitWork}
                </span>
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-destructive hover:text-destructive"
              onClick={handleDrop}
              disabled={isLoading}
            >
              <span className="uppercase tracking-widest text-xs font-bold">
                {isLoading ? 'DROPPING...' : actions.drop}
              </span>
            </Button>
          </div>
        )}

        {/* CLAIMED — someone else claimed */}
        {status === 'claimed' && !isClaimer && (
          <div className="text-xs uppercase tracking-widest text-muted-foreground text-center py-2">
            {actions.inProgress}
          </div>
        )}

        {/* COMPLETED */}
        {status === 'completed' && (
          <div className="text-xs uppercase tracking-widest text-green-400 text-center py-2">
            QUEST COMPLETE
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-destructive text-center">{error}</p>
        )}
      </Card>

      {/* Claimer info — if claimed or completed */}
      {(status === 'claimed' || status === 'completed') && claimer && (
        <Card className="bg-card border-border/50 rounded-[16px] p-5 flex flex-col gap-3">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            {status === 'completed' ? 'COMPLETED BY' : 'CLAIMED BY'}
          </span>
          <div className="flex items-center gap-3">
            <UserAvatar src={claimer.avatar_url} username={claimer.username ?? 'Unknown'} size="sm" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                @{claimer.username ?? 'Unknown'}
              </span>
              {claimedAt && (
                <TimeAgo date={claimedAt} className="text-xs text-muted-foreground" />
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Posted by */}
      {poster && (
        <Card className="bg-card border-border/50 rounded-[16px] p-5 flex flex-col gap-3">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            POSTED BY
          </span>
          <div className="flex items-center gap-3">
            <UserAvatar src={poster.avatar_url} username={poster.username ?? 'Unknown'} size="sm" />
            <span className="text-sm font-semibold text-foreground">
              @{poster.username ?? 'Unknown'}
            </span>
          </div>
        </Card>
      )}

      {/* On-chain proof — completed only */}
      {status === 'completed' && txHash && completedAt && (
        <OnChainProofBlock txHash={txHash} completedAt={completedAt} />
      )}

    </div>
  )
}
