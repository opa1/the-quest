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
import { Loader2, CheckCircle2, AlertCircle, Clock, XCircle } from 'lucide-react'

interface TaskActionPanelProps {
  taskId: string
  status: 'open' | 'claimed' | 'submitted' | 'rejected' | 'completed' | 'cancelled'
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
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [claimed, setClaimed] = useState(false)
  const { actions } = QUEST_CONFIG.taskDetail

  const isCreator = user?.id === createdById
  const isClaimer = user?.id === claimedById

  const handleClaim = async () => {
    setIsLoading(true)
    setError(null)

    const result = await claimTask(taskId)

    if (result.error) {
      setError(result.message ?? 'Something went wrong. Please try again.')
      setIsLoading(false)
      return
    }

    setClaimed(true)
    setIsLoading(false)
  }

  const handleDrop = async () => {
    setIsLoading(true)
    setError(null)

    const result = await dropTask(taskId)

    if (result.error) {
      setError(result.message ?? 'Something went wrong. Please try again.')
      setIsLoading(false)
      return
    }

    setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* XP Reward card */}
      <Card className="bg-card border-border/50 rounded-[16px] p-6 flex flex-col gap-4">
        <XPReward xp={xp} />

        <Separator />

        {/* OPEN — not creator */}
        {status === 'open' && !isCreator && (
          <>
            {claimed ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-widest">
                    Mission Claimed
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Head to your{' '}
                  <a href="/record" className="text-primary underline underline-offset-2">
                    Record
                  </a>{' '}
                  to track your active missions.
                </p>
                <Button variant="default" size="sm" className="w-full" asChild>
                  <a href={`/tasks/${taskId}/submit`}>
                    <span className="uppercase tracking-widest text-xs font-bold">
                      SUBMIT WORK
                    </span>
                  </a>
                </Button>
              </div>
            ) : (
              <Button
                variant="default"
                size="lg"
                className="w-full"
                onClick={handleClaim}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="uppercase tracking-widest text-sm font-bold">
                      CLAIMING...
                    </span>
                  </>
                ) : (
                  <span className="uppercase tracking-widest text-sm font-bold">
                    {actions.claim}
                  </span>
                )}
              </Button>
            )}
          </>
        )}

        {/* OPEN — is creator */}
        {status === 'open' && isCreator && (
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

        {/* SUBMITTED — claimer awaiting review */}
        {status === 'submitted' && isClaimer && (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest font-bold">Proof Submitted</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Your submission is awaiting review by the mission poster.
            </p>
          </div>
        )}

        {/* SUBMITTED — poster can review */}
        {status === 'submitted' && isCreator && (
          <Button variant="default" size="lg" className="w-full" asChild>
            <a href={`/tasks/${taskId}/review`}>
              <span className="uppercase tracking-widest text-sm font-bold">REVIEW SUBMISSION</span>
            </a>
          </Button>
        )}

        {/* SUBMITTED — other viewer */}
        {status === 'submitted' && !isClaimer && !isCreator && (
          <div className="text-xs uppercase tracking-widest text-muted-foreground text-center py-2">
            AWAITING REVIEW
          </div>
        )}

        {/* REJECTED — claimer can resubmit */}
        {status === 'rejected' && isClaimer && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-destructive justify-center py-1">
              <XCircle className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest font-bold">Submission Rejected</span>
            </div>
            <Button variant="default" size="lg" className="w-full" asChild>
              <a href={`/tasks/${taskId}/submit`}>
                <span className="uppercase tracking-widest text-sm font-bold">RESUBMIT</span>
              </a>
            </Button>
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
          <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-[10px] px-4 py-3">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive leading-snug">{error}</p>
          </div>
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
