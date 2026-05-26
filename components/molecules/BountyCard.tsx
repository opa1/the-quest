import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { CategoryBadge } from "@/components/atoms/CategoryBadge"
import { DifficultyBadge } from "@/components/atoms/DifficultyBadge"
import { XPReward } from "@/components/atoms/XPReward"
import { AdaReward } from "@/components/atoms/AdaReward"
import ProofTypeBadge from "@/components/atoms/ProofTypeBadge"
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
}: BountyCardProps) {
  const isReviewable =
    taskStatus === "submitted" && currentUserId && currentUserId === createdBy

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
          <CategoryBadge label={category} />
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
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              {xp > 0 && <XPReward xp={xp} />}
              {adaReward !== undefined && <AdaReward lovelace={adaReward} />}
            </div>
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
