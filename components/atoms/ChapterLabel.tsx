import { cn } from "@/lib/utils"

interface ChapterLabelProps {
  label: string
  variant?: "pill" | "text"
  decorated?: boolean
  className?: string
}

export function ChapterLabel({ label, className }: ChapterLabelProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full bg-muted px-4 py-2 text-xs font-semibold tracking-widest text-primary uppercase",
        className
      )}
    >
      {label}
    </span>
  )
}
