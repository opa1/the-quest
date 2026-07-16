"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { XPReward } from "@/components/atoms/XPReward"
import { AdaReward } from "@/components/atoms/AdaReward"
import UserAvatar from "@/components/atoms/UserAvatar"
import TimeAgo from "@/components/atoms/TimeAgo"
import PayoutProofList, { type Payout } from "@/components/molecules/PayoutProofList"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuthStore } from "@/lib/stores/auth.store"
import { competingLabel } from "@/lib/utils/claim-counts"
import { formatAda } from "@/lib/utils/currency"
import type { Network } from "@/lib/config/network"
import { closeMission } from "@/app/actions/tasks"
import { QUEST_CONFIG } from "@/lib/config/quest.config"
import { CheckCircle2, AlertCircle, Clock, XCircle } from "lucide-react"

type ClaimStatus = "claimed" | "submitted" | "approved" | "rejected"

interface TaskActionPanelProps {
  taskId: string
  status: "open" | "claimed" | "submitted" | "rejected" | "completed" | "cancelled"
  createdById: string
  maxClaimers: number
  myClaimStatus: ClaimStatus | null
  /** Submissions awaiting the poster's review. */
  submittedCount: number
  /** Everyone competing: submitted + approved. Reserves no slot. */
  submissionCount?: number
  /** True when closing removes the mission outright — nobody ever did work on
   *  it. Mirrors closeMission's own rule so the dialog can't promise the wrong
   *  outcome. */
  willDelete?: boolean
  approvedClaimers?: number
  deadline?: string | null
  refundStatus?: string | null
  rewardPerClaimer?: number
  xp: number
  adaReward: number
  /** Everyone this mission has actually paid, newest first. May be empty. */
  payouts: Payout[]
  /** Resolved from the cookie server-side — see the note at the call site. */
  network: Network
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
  submittedCount,
  submissionCount,
  willDelete,
  approvedClaimers,
  deadline,
  refundStatus,
  rewardPerClaimer,
  xp,
  adaReward,
  payouts,
  network,
  claimedAt,
  claimer,
  poster,
}: TaskActionPanelProps) {
  const { user, openDialog } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { actions } = QUEST_CONFIG.taskDetail

  useEffect(() => setMounted(true), [])

  const isCreator = mounted ? user?.id === createdById : false
  const isGuest = mounted && !user

  const myStatus: ClaimStatus | null = myClaimStatus

  const isMulti = maxClaimers > 1
  const isTaskComplete = status === "completed"

  // No slot to reserve any more: anyone may submit while the mission is live,
  // and the poster decides who gets paid. A 'claimed' status only appears on
  // rows that predate the claim step being removed — those operatives can
  // simply submit, which reuses their row.
  const canSubmit =
    mounted &&
    !isCreator &&
    !isGuest &&
    !isTaskComplete &&
    status !== "cancelled" &&
    myStatus !== "submitted" &&
    myStatus !== "approved"

  const handleClose = async () => {
    setIsLoading(true)
    setError(null)

    const result = await closeMission(taskId)

    if ("error" in result && result.error) {
      setError(result.message ?? "Something went wrong. Please try again.")
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    // A deleted mission has no page left to reload into.
    if ("deleted" in result && result.deleted) {
      window.location.href = "/missions"
      return
    }
    // Server-rendered status/slots drive this panel, so re-read rather than
    // patching local state to match.
    window.location.reload()
  }

  // Mirrors closeAndRefundUnfilled: only slots nobody was paid for come back,
  // priced the same way the server prices them.
  const unfilledSlots = Math.max(0, maxClaimers - (approvedClaimers ?? 0))
  const refundPreview = unfilledSlots * (rewardPerClaimer ?? adaReward)

  const isClosed = status === "completed" || status === "cancelled"
  // Nothing retries a poster-initiated refund automatically — the cron only
  // touches missions past their deadline — so the poster needs a way back in.
  const canRetryRefund = isCreator && isClosed && refundStatus === "failed"

  const submitButton = (
    <Button variant="default" size="lg" className="w-full" asChild>
      <a href={`/tasks/${taskId}/submit`}>
        <span className="text-sm font-bold tracking-widest uppercase">
          {myStatus === "rejected" ? "Submit Again" : actions.submitWork}
        </span>
      </a>
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

        {/* The bar tracks what has been paid, and the only number beside it is
            that one. Competition is phrased separately so it can't be read as
            the bar's own quantity. */}
        {isMulti && (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Slots
              </span>
              <span className="text-xs font-bold text-foreground">
                {approvedClaimers ?? 0} of {maxClaimers} paid
              </span>
            </div>
            <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, ((approvedClaimers ?? 0) / maxClaimers) * 100)}%`,
                }}
              />
            </div>
            <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
              {competingLabel(submissionCount, maxClaimers)}
            </span>
          </div>
        )}

        {/* Deadline shown while the mission is still open */}
        {deadline && status === "open" && (
          <div className="flex items-center gap-2 rounded-[10px] border border-primary/40 bg-primary/5 px-3 py-2">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">
                Mission Deadline
              </span>
              <span className="text-xs font-semibold text-foreground">
                {new Date(deadline).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
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
              Sign in to submit
            </span>
          </Button>
        )}

        {/* Creator */}
        {!isTaskComplete && isCreator && (
          <div className="flex flex-col gap-3">
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

            {/* Pull the mission and take back the ADA for slots nobody was paid
                for. Without this the deposit is stuck until the deadline — and
                a mission posted without one never reaches it. */}
            {!isClosed && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-destructive hover:text-destructive"
                    disabled={isLoading}
                  >
                    <span className="text-xs font-bold tracking-widest uppercase">
                      {isLoading
                        ? willDelete
                          ? "DELETING..."
                          : "CLOSING..."
                        : willDelete
                          ? "Delete Mission"
                          : "Close Mission"}
                    </span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {willDelete
                        ? "Delete this mission?"
                        : "Close this mission?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <span>
                          {willDelete
                            ? "Nobody has submitted to it, so it will be removed from the board completely. This cannot be undone."
                            : "It comes off the board and nobody can submit to it again. It stays visible, marked cancelled. This cannot be undone."}
                        </span>
                        {refundPreview > 0 && (
                          <span>
                            <strong className="text-foreground">
                              {formatAda(refundPreview, network)}
                            </strong>{" "}
                            for {unfilledSlots} unfilled slot
                            {unfilledSlots > 1 ? "s" : ""} will be refunded to
                            your wallet. Anything you already approved stays
                            paid.
                          </span>
                        )}
                        {submittedCount > 0 && (
                          <span className="text-destructive">
                            {submittedCount} submission
                            {submittedCount > 1 ? "s are" : " is"} still awaiting
                            review and will be rejected. Consider reviewing
                            {submittedCount > 1 ? " them" : " it"} first.
                          </span>
                        )}
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep it open</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClose}>
                      {willDelete ? "Delete and refund" : "Close and refund"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}

        {/* The mission closed but the ADA never made it back. Surfaced rather
            than left silent: no cron will pick this up if the mission had no
            deadline, so the poster pressing this is the only retry there is. */}
        {canRetryRefund && (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2 rounded-[10px] border border-destructive/40 bg-destructive/5 px-3 py-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold tracking-widest text-destructive uppercase">
                  Refund Failed
                </span>
                <span className="text-xs text-muted-foreground">
                  This mission closed but {formatAda(refundPreview, network)}{" "}
                  did not make it back to your wallet.
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleClose}
              disabled={isLoading}
            >
              <span className="text-xs font-bold tracking-widest uppercase">
                {isLoading ? "RETRYING..." : "Retry Refund"}
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

        {/* Viewer was rejected — they can rework it and go again while the
            mission is still live. */}
        {!isTaskComplete && !isCreator && myStatus === "rejected" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2 py-1 text-destructive">
              <XCircle className="h-4 w-4" />
              <span className="text-xs font-bold tracking-widest uppercase">
                Submission Rejected
              </span>
            </div>
            {canSubmit ? (
              submitButton
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                This mission is closed and no longer accepts submissions.
              </p>
            )}
          </div>
        )}

        {/* Viewer hasn't submitted yet. No slot to run out of — the only reason
            they can't is the mission being closed. */}
        {!isTaskComplete &&
          !isCreator &&
          !isGuest &&
          (myStatus === null || myStatus === "claimed") &&
          (canSubmit ? (
            submitButton
          ) : (
            <div className="py-2 text-center text-xs tracking-widest text-muted-foreground uppercase">
              Mission closed
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

      {/* Fallback attribution for legacy completions with no transaction to
          show — pre-ADA-era missions recorded a claimer but no payout. Anything
          with a transaction is covered by PayoutProofList above, which says who
          was paid and proves it, so this would only duplicate it. Reads
          tasks.claimed_by, which is no longer written; new missions never hit
          this branch. */}
      {status === "completed" && claimer && payouts.length === 0 && (
        <Card className="flex flex-col gap-3 rounded-[16px] border-border/50 bg-card p-5">
          <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            COMPLETED BY
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
      {/* Not gated on 'completed': a mission that has paid one of two hunters
          has still moved real ADA, and the proof of it belongs here. */}
      <PayoutProofList
        payouts={payouts}
        adaReward={rewardPerClaimer ?? adaReward}
        maxClaimers={maxClaimers}
        network={network}
      />
    </div>
  )
}
