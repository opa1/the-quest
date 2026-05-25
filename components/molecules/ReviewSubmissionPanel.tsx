'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
} from '@/components/ui/alert-dialog'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import UserAvatar from '@/components/atoms/UserAvatar'
import { approveWork, rejectWork, banUser } from '@/app/actions/tasks'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

interface ReviewSubmissionPanelProps {
  taskId: string
  claimerId: string
  claimer: { username: string | null; avatar_url: string | null }
  redirectTo: string
}

const cfg = QUEST_CONFIG.reviewPanel

export default function ReviewSubmissionPanel({
  taskId, claimerId, claimer, redirectTo,
}: ReviewSubmissionPanelProps) {
  const router = useRouter()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [isBanning, setIsBanning] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [bannedSuccess, setBannedSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async () => {
    setIsApproving(true)
    setError(null)
    const result = await approveWork(taskId)
    if (result.error) {
      setError(result.message ?? 'Something went wrong.')
      setIsApproving(false)
      return
    }
    router.push(redirectTo)
  }

  const handleReject = async () => {
    setIsRejecting(true)
    setError(null)
    const result = await rejectWork(taskId, rejectReason.trim() || undefined)
    if (result.error) {
      setError(result.message ?? 'Something went wrong.')
      setIsRejecting(false)
      return
    }
    router.push(redirectTo)
  }

  const handleBan = async () => {
    setIsBanning(true)
    setError(null)
    const result = await banUser(taskId, claimerId, banReason.trim() || undefined)
    if (result.error) {
      setError(result.message ?? 'Something went wrong.')
      setIsBanning(false)
      return
    }
    setBannedSuccess(true)
    setIsBanning(false)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Claimer context */}
      <div className="flex items-center gap-3 pb-2 border-b border-border/30">
        <UserAvatar src={claimer.avatar_url} username={claimer.username ?? 'Unknown'} size="sm" />
        <span className="text-sm font-semibold text-foreground">
          @{claimer.username ?? 'Unknown'}
        </span>
      </div>

      {/* Approve */}
      <Button
        variant="default"
        size="lg"
        className="w-full bg-green-600 hover:bg-green-500 text-white"
        onClick={handleApprove}
        disabled={isApproving || isRejecting}
      >
        {isApproving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="uppercase tracking-widest text-sm font-bold">APPROVING...</span>
          </>
        ) : (
          <span className="uppercase tracking-widest text-sm font-bold">{cfg.approveButton}</span>
        )}
      </Button>

      {/* Reject toggle */}
      {!rejectOpen ? (
        <Button
          variant="outline"
          size="lg"
          className="w-full border-destructive/50 text-destructive hover:text-destructive hover:border-destructive"
          onClick={() => setRejectOpen(true)}
          disabled={isApproving || isRejecting}
        >
          <span className="uppercase tracking-widest text-sm font-bold">{cfg.rejectButton}</span>
        </Button>
      ) : (
        <div className="flex flex-col gap-3 border border-destructive/30 rounded-[12px] p-4">
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={cfg.rejectReasonPlaceholder}
            rows={3}
            className="bg-muted/30 border-border/50 resize-none text-sm"
          />
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => { setRejectOpen(false); setRejectReason('') }}
              disabled={isRejecting}
            >
              <span className="uppercase tracking-widest text-xs font-bold">Cancel</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={handleReject}
              disabled={isRejecting}
            >
              {isRejecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="uppercase tracking-widest text-xs font-bold">{cfg.confirmRejectButton}</span>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Ban user */}
      {!bannedSuccess ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-destructive/70 hover:text-destructive text-xs uppercase tracking-widest font-bold"
              disabled={isBanning}
            >
              {cfg.banButton}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-border/50">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-heading uppercase tracking-widest">
                {cfg.banConfirmTitle}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground text-sm">
                {cfg.banConfirmDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Reason (optional)..."
              rows={2}
              className="bg-muted/30 border-border/50 resize-none text-sm"
            />
            <AlertDialogFooter>
              <AlertDialogCancel className="uppercase tracking-widest text-xs font-bold">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 uppercase tracking-widest text-xs font-bold"
                onClick={handleBan}
              >
                {cfg.banConfirmButton}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <div className="flex items-center gap-2 text-green-400 text-sm justify-center py-1">
          <CheckCircle2 className="w-4 h-4" />
          <span className="uppercase tracking-widest text-xs font-bold">User banned</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-[10px] px-4 py-3">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive leading-snug">{error}</p>
        </div>
      )}

    </div>
  )
}
