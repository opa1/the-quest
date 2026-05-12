import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

interface AvatarStackProps {
  count: string
  label: string
  avatars?: string[]
  className?: string
}

const PLACEHOLDER_COLORS = ["bg-amber-700", "bg-amber-800", "bg-amber-900"]

export function AvatarStack({
  count,
  label,
  avatars,
  className,
}: AvatarStackProps) {
  const circles = avatars?.length ? avatars : PLACEHOLDER_COLORS

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex -space-x-2">
        {circles
          .slice(0, 3)
          .map((src, i) =>
            avatars?.length ? (
              <img
                key={i}
                src={src}
                alt=""
                className="size-12 rounded-full border-2 border-background object-cover"
              />
            ) : (
              <div
                key={i}
                className={cn(
                  "size-12 rounded-full border-2 border-background",
                  src
                )}
              />
            )
          )}
        <div className="flex size-12 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-bold text-primary">
          <Plus className="size-5" />
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-2xl leading-none font-bold text-foreground">
          {count}
        </span>
        <span className="text-xs tracking-widest text-muted-foreground uppercase">
          {label}
        </span>
      </div>
    </div>
  )
}
