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

interface TaskActionPanelProps {
  taskId: string
  status:
    | "open"
    | "claimed"
    | "submitted"
    | "rejected"
    | "completed"
    | "cancelled"
  createdById: string
  claimedById: string | null
  xp: number
  adaReward: number
  proofType: string
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
  claimedById,
  xp,
  adaReward,
  txHash,
  completedAt,
  claimedAt,
  claimer,
  poster,
}: TaskActionPanelProps) {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [claimed, setClaimed] = useState(false)
  const { actions } = QUEST_CONFIG.taskDetail

  useEffect(() => setMounted(true), [])

  const isCreator = mounted ? user?.id === createdById : false
  const isClaimer = mounted ? user?.id === claimedById : false

  const handleClaim = async () => {
    setIsLoading(true)
    setError(null)

    const result = await claimTask(taskId)
    console.log("claim result:", result)

    if (result.error) {
      setError(result.message ?? "Something went wrong. Please try again.")
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
      setError(result.message ?? "Something went wrong. Please try again.")
      setIsLoading(false)
      return
    }

    setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* XP Reward card */}
      <Card className="flex flex-col gap-4 rounded-[16px] border-border/50 bg-card p-6">
        {adaReward > 0 && <AdaReward lovelace={adaReward} />}
        <XPReward xp={xp} />

        <Separator />

        {/* OPEN — not creator */}
        {status === "open" && !isCreator && (
          <>
            {claimed ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-bold tracking-widest uppercase">
                    Mission Claimed
                  </span>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Head to your{" "}
                  <a
                    href="/record"
                    className="text-primary underline underline-offset-2"
                  >
                    Record
                  </a>{" "}
                  to track your active missions.
                </p>
                <Button variant="default" size="sm" className="w-full" asChild>
                  <a href={`/tasks/${taskId}/submit`}>
                    <span className="text-xs font-bold tracking-widest uppercase">
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
            )}
          </>
        )}

        {/* OPEN — is creator */}
        {status === "open" && isCreator && (
          <div className="py-2 text-center text-xs tracking-widest text-muted-foreground uppercase">
            {actions.youPosted}
          </div>
        )}

        {/* CLAIMED — current user is claimer */}
        {status === "claimed" && isClaimer && (
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

        {/* CLAIMED — someone else claimed */}
        {status === "claimed" && !isClaimer && (
          <div className="py-2 text-center text-xs tracking-widest text-muted-foreground uppercase">
            {actions.inProgress}
          </div>
        )}

        {/* SUBMITTED — claimer awaiting review */}
        {status === "submitted" && isClaimer && (
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

        {/* SUBMITTED — poster can review */}
        {status === "submitted" && isCreator && (
          <Button variant="default" size="lg" className="w-full" asChild>
            <a href={`/tasks/${taskId}/review`}>
              <span className="text-sm font-bold tracking-widest uppercase">
                REVIEW SUBMISSION
              </span>
            </a>
          </Button>
        )}

        {/* SUBMITTED — other viewer */}
        {status === "submitted" && !isClaimer && !isCreator && (
          <div className="py-2 text-center text-xs tracking-widest text-muted-foreground uppercase">
            AWAITING REVIEW
          </div>
        )}

        {/* REJECTED — claimer can resubmit */}
        {status === "rejected" && isClaimer && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2 py-1 text-destructive">
              <XCircle className="h-4 w-4" />
              <span className="text-xs font-bold tracking-widest uppercase">
                Submission Rejected
              </span>
            </div>
            <Button variant="default" size="lg" className="w-full" asChild>
              <a href={`/tasks/${taskId}/submit`}>
                <span className="text-sm font-bold tracking-widest uppercase">
                  RESUBMIT
                </span>
              </a>
            </Button>
          </div>
        )}

        {/* COMPLETED */}
        {status === "completed" && (
          <div className="py-2 text-center text-xs tracking-widest text-green-400 uppercase">
            QUEST COMPLETE
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-[10px] border border-destructive/30 bg-destructive/10 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm leading-snug text-destructive">{error}</p>
          </div>
        )}
      </Card>

      {/* Claimer info — if claimed or completed */}
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

      {/* On-chain proof — completed only */}
      {status === "completed" && txHash && completedAt && (
        <OnChainProofBlock txHash={txHash} completedAt={completedAt} />
      )}
    </div>
  )
}
