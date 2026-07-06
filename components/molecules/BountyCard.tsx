import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { CategoryBadge } from "@/components/atoms/CategoryBadge"
import { DifficultyBadge } from "@/components/atoms/DifficultyBadge"
import { XPReward } from "@/components/atoms/XPReward"
import { AdaReward } from "@/components/atoms/AdaReward"
import ProofTypeBadge from "@/components/atoms/ProofTypeBadge"
import ShareMissionButton from "@/components/molecules/ShareMissionButton"
import { cn } from "@/lib/utils"

type Difficulty = "EASY" | "MEDIUM" | "HARD"

interface BountyCardProps {
  id: string
  category: string
  difficulty: Difficulty
  title: string
  description: string
  xp: number
  featured?: boolean
  className?: string
  currentUserId?: string
  createdBy?: string
  taskStatus?: string
  adaReward?: number
  proofType?: "url" | "text" | "image" | "any"
  shareable?: boolean
  maxClaimers?: number
  approvedClaimers?: number
  deadline?: string | null
  rewardPerClaimer?: number
}

export function BountyCard({
  id,
  category,
  difficulty,
  title,
  description,
  xp,
  featured,
  className,
  currentUserId,
  createdBy,
  taskStatus,
  adaReward,
  proofType,
  shareable,
  maxClaimers,
  approvedClaimers,
  deadline,
  rewardPerClaimer,
}: BountyCardProps) {
  const isReviewable =
    taskStatus === "submitted" && currentUserId && currentUserId === createdBy

  const isMulti = (maxClaimers ?? 1) > 1
  const displayLovelace =
    isMulti && rewardPerClaimer !== undefined && rewardPerClaimer > 0
      ? rewardPerClaimer
      : adaReward
  const deadlineLabel = deadline
    ? new Date(deadline).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null

  return (
    <Link href={`/tasks/${id}`} className="block h-full">
      <Card
        className={cn(
          "flex h-full cursor-pointer flex-col gap-4 rounded-[16px] border border-border bg-card p-6 transition-colors duration-200 hover:border-primary/50",
          featured &&
            "border-primary shadow-[0_0_24px_oklch(0.795_0.184_86.047/0.2)]",
          className
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CategoryBadge label={category} />
            {isMulti && (
              <span className="rounded-full border border-amber-800 bg-amber-950 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-400 uppercase">
                Up to {maxClaimers} hunters
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {proofType && <ProofTypeBadge proofType={proofType} />}
            <DifficultyBadge difficulty={difficulty} />
          </div>
        </div>

        <h3 className="text-lg leading-snug font-bold text-foreground">
          {title}
        </h3>

        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <Separator className="my-1 bg-border/50" />

        <div className="flex flex-col gap-2">
          {(isMulti && approvedClaimers !== undefined) || deadlineLabel ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {isMulti && approvedClaimers !== undefined && (
                <span>
                  {approvedClaimers} of {maxClaimers} slots filled
                </span>
              )}
              {deadlineLabel && <span>Deadline: {deadlineLabel}</span>}
            </div>
          ) : null}
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                {displayLovelace !== undefined && (
                  <AdaReward lovelace={displayLovelace} />
                )}
                {isMulti &&
                  displayLovelace !== undefined &&
                  displayLovelace > 0 && (
                    <span className="text-[10px] text-muted-foreground uppercase">
                      per person
                    </span>
                  )}
              </div>
              {xp > 0 && <XPReward xp={xp} />}
            </div>
            {shareable && <ShareMissionButton taskId={id} title={title} />}
          </div>

          {isReviewable && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full border-primary/50 text-primary hover:border-primary hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                href={`/tasks/${id}/review`}
                className="flex items-center justify-center gap-2"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="text-xs font-bold tracking-widest uppercase">
                  REVIEW
                </span>
              </Link>
            </Button>
          )}
        </div>
      </Card>
    </Link>
  )
}
