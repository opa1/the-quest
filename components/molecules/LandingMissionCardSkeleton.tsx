import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function LandingMissionCardSkeleton() {
  return (
    <Card className="flex h-full flex-col gap-4 rounded-[16px] border border-border bg-card p-6">
      {/* Badge row */}
      <div className="flex items-center justify-between gap-2">
        <div className="h-5 w-20 animate-pulse rounded-md bg-muted/30" />
        <div className="h-5 w-16 animate-pulse rounded-md bg-muted/30" />
      </div>

      {/* Title */}
      <div className="flex flex-col gap-2">
        <div className="h-4 w-full animate-pulse rounded bg-muted/30" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted/30" />
      </div>

      {/* Description */}
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="h-3.5 w-full animate-pulse rounded bg-muted/30" />
        <div className="h-3.5 w-full animate-pulse rounded bg-muted/30" />
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted/30" />
      </div>

      <Separator className="my-1 bg-border/50" />

      {/* Reward row */}
      <div className="flex flex-col gap-3">
        <div className="h-7 w-32 animate-pulse rounded bg-muted/30" />
        <div className="h-4 w-16 animate-pulse rounded bg-muted/30" />
        {/* Button */}
        <div className="h-8 w-full animate-pulse rounded-md bg-muted/30" />
      </div>
    </Card>
  )
}
