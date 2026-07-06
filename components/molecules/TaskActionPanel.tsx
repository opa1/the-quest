"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { XPReward } from "@/components/atoms/XPReward"
import { AdaReward } from "@/components/atoms/AdaReward"
import UserAvatar from "@/components/atoms/UserAvatar"
import TimeAgo from "@/components/atoms/TimeAgo"
import OnChainProofBlock from "@/components/atoms/OnChainProofBlock"
import { useAuthStore } from "@/lib/stores/auth.store"
import { claimTask, dropTask } from "@/app/actions/tasks"
import { QUEST_CONFIG } from "@/lib/config/quest.config"
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
} from "lucide-react"

type ClaimStatus = "claimed" | "submitted" | "approved" | "rejected"

interface TaskActionPanelProps {
  taskId: string
  status: "open" | "claimed" | "submitted" | "rejected" | "completed" | "cancelled"
  createdById: string
  maxClaimers: number
  myClaimStatus: ClaimStatus | null
  slotsRemaining: number
  submittedCount: number
  approvedClaimers?: number
  deadline?: string | null
  rewardPerClaimer?: number
  xp: number
  adaReward: number
  txHash: string | null
  completedAt: string | null
  claimedAt: string | null
  claimer: { username: string | null; avatar_url: string | null } | null
  poster: { username: string | null; avatar_url: string | null } | null
}

export default function TaskActionPanel({
  taskId,
  status,
  createdById,
  maxClaimers,
  myClaimStatus,
  slotsRemaining,
  submittedCount,
  approvedClaimers,
  deadline,
  rewardPerClaimer,
  xp,
  adaReward,
  txHash,
  completedAt,
  claimedAt,
  claimer,
  poster,
}: TaskActionPanelProps) {
  const { user, openDialog } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Optimistic override once the viewer claims/drops in this session.
  const [localClaim, setLocalClaim] = useState<ClaimStatus | null>(null)
  const [dropped, setDropped] = useState(false)
  const { actions } = QUEST_CONFIG.taskDetail

  useEffect(() => setMounted(true), [])

  const isCreator = mounted ? user?.id === createdById : false
  const isGuest = mounted && !user

  const myStatus: ClaimStatus | null = dropped
    ? null
    : (localClaim ?? myClaimStatus)

  const isMulti = maxClaimers > 1
  const effectiveSlots = slotsRemaining - (localClaim === "claimed" ? 1 : 0)
  const isTaskComplete = status === "completed"
  const canClaim =
    mounted &&
    !isCreator &&
    !isGuest &&
    !isTaskComplete &&
    (myStatus === null || myStatus === "rejected") &&
    effectiveSlots > 0

  const handleClaim = async () => {
    setIsLoading(true)
    setError(null)

    const result = await claimTask(taskId)

    if (result.error) {
      setError(result.message ?? "Something went wrong. Please try again.")
      setIsLoading(false)
      return
    }

    setLocalClaim("claimed")
    setDropped(false)
    setIsLoading(false)
  }

  const handleDrop = async () => {
    setIsLoading(true)
    setError(null)

    const result = await dropTask(taskId)

    if (result.error) {
      setError(result.message ?? "Something went wrong. Please try again.")
      setIsLoading(false)
      return
    }

    setDropped(true)
    setLocalClaim(null)
    setIsLoading(false)
  }

  const claimButton = (
    <Button
      variant="default"
      size="lg"
      className="w-full"
      onClick={handleClaim}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span className="text-sm font-bold tracking-widest uppercase">
            CLAIMING...
          </span>
        </>
      ) : (
        <span className="text-sm font-bold tracking-widest uppercase">
          {actions.claim}
        </span>
      )}
    </Button>
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Reward card */}
      <Card className="flex flex-col gap-4 rounded-[16px] border-border/50 bg-card p-6">
        {isMulti && rewardPerClaimer && rewardPerClaimer > 0 ? (
          <div className="flex items-center gap-1.5">
            <AdaReward lovelace={rewardPerClaimer} />
            <span className="text-[10px] text-muted-foreground uppercase">
              per person
            </span>
          </div>
        ) : (
          adaReward > 0 && <AdaReward lovelace={adaReward} />
        )}
        <XPReward xp={xp} />

        {/* Slot progress for multi-claimer missions */}
        {isMulti && (
          <div className="text-center text-xs text-muted-foreground">
            {approvedClaimers ?? 0} of {maxClaimers} slots filled
          </div>
        )}

        {/* Deadline shown while the mission is still open */}
        {deadline && status === "open" && (
          <div className="text-center text-xs text-muted-foreground">
            Deadline:{" "}
            {new Date(deadline).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        )}

        <Separator />

        {/* Completed mission */}
        {isTaskComplete && myStatus !== "approved" && (
          <div className="py-2 text-center text-xs tracking-widest text-green-400 uppercase">
            QUEST COMPLETE
          </div>
        )}

        {/* Viewer's own approved claim */}
        {myStatus === "approved" && (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-bold tracking-widest uppercase">
                Reward Claimed
              </span>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Your submission was approved. See it on your{" "}
              <a href="/record" className="text-primary underline underline-offset-2">
                Record
              </a>
              .
            </p>
          </div>
        )}

        {/* Guest - must sign in to claim */}
        {!isTaskComplete && isGuest && (
          <Button
            variant="default"
            size="lg"
            className="w-full"
            onClick={() => openDialog(`/tasks/${taskId}`)}
          >
            <span className="text-sm font-bold tracking-widest uppercase">
              Sign in to claim
            </span>
          </Button>
        )}

        {/* Creator */}
        {!isTaskComplete && isCreator && (
          <>
            {submittedCount > 0 ? (
              <Button variant="default" size="lg" className="w-full" asChild>
                <a href={`/tasks/${taskId}/review`}>
                  <span className="text-sm font-bold tracking-widest uppercase">
                    Review Submissions ({submittedCount})
                  </span>
                </a>
              </Button>
            ) : (
              <div className="py-2 text-center text-xs tracking-widest text-muted-foreground uppercase">
                {actions.youPosted}
              </div>
            )}
          </>
        )}

        {/* Viewer holds an active claim */}
        {!isTaskComplete && !isCreator && myStatus === "claimed" && (
          <div className="flex flex-col gap-3">
            <Button variant="default" size="lg" className="w-full" asChild>
              <a href={`/tasks/${taskId}/submit`}>
                <span className="text-sm font-bold tracking-widest uppercase">
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
              <span className="text-xs font-bold tracking-widest uppercase">
                {isLoading ? "DROPPING..." : actions.drop}
              </span>
            </Button>
          </div>
        )}

        {/* Viewer submitted - awaiting review */}
        {!isTaskComplete && !isCreator && myStatus === "submitted" && (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-bold tracking-widest uppercase">
                Proof Submitted
              </span>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Your submission is awaiting review by the mission poster.
            </p>
          </div>
        )}

        {/* Viewer was rejected but may re-claim if a slot is free */}
        {!isTaskComplete && !isCreator && myStatus === "rejected" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2 py-1 text-destructive">
              <XCircle className="h-4 w-4" />
              <span className="text-xs font-bold tracking-widest uppercase">
                Submission Rejected
              </span>
            </div>
            {canClaim ? (
              claimButton
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                This mission is no longer accepting claims.
              </p>
            )}
          </div>
        )}

        {/* Viewer has no claim - offer to claim or show it's full */}
        {!isTaskComplete &&
          !isCreator &&
          !isGuest &&
          myStatus === null &&
          (canClaim ? (
            claimButton
          ) : (
            <div className="py-2 text-center text-xs tracking-widest text-muted-foreground uppercase">
              {isMulti ? "All slots filled" : actions.inProgress}
            </div>
          ))}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-[10px] border border-destructive/30 bg-destructive/10 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm leading-snug text-destructive">{error}</p>
          </div>
        )}
      </Card>

      {/* Claimer info - single-claimer missions surface the claimer here */}
      {(status === "claimed" || status === "completed") && claimer && (
        <Card className="flex flex-col gap-3 rounded-[16px] border-border/50 bg-card p-5">
          <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            {status === "completed" ? "COMPLETED BY" : "CLAIMED BY"}
          </span>
          <div className="flex items-center gap-3">
            <UserAvatar
              src={claimer.avatar_url}
              username={claimer.username ?? "Unknown"}
              size="sm"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                @{claimer.username ?? "Unknown"}
              </span>
              {claimedAt && (
                <TimeAgo
                  date={claimedAt}
                  className="text-xs text-muted-foreground"
                />
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Posted by */}
      {poster && (
        <Card className="flex flex-col gap-3 rounded-[16px] border-border/50 bg-card p-5">
          <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            POSTED BY
          </span>
          <div className="flex items-center gap-3">
            <UserAvatar
              src={poster.avatar_url}
              username={poster.username ?? "Unknown"}
              size="sm"
            />
            <span className="text-sm font-semibold text-foreground">
              @{poster.username ?? "Unknown"}
            </span>
          </div>
        </Card>
      )}

      {/* On-chain proof - completed only */}
      {status === "completed" && txHash && completedAt && (
        <OnChainProofBlock txHash={txHash} completedAt={completedAt} />
      )}
    </div>
  )
}
