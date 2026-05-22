import Link from "next/link"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileNavPostButtonProps {
  href: string
  isCancel?: boolean
  onClick?: () => void
  className?: string
}

export default function MobileNavPostButton({
  href,
  isCancel = false,
  onClick,
  className,
}: MobileNavPostButtonProps) {
  const inner = (
    <div
      className={cn(
        "h-16 w-16 rounded-full border-4 flex items-center justify-center transition-all duration-300",
        isCancel
          ? "border-background bg-rose-950/80 hover:bg-rose-950"
          : "border-background bg-primary hover:bg-primary/90",
        className
      )}
    >
      <Plus
        className={cn(
          "h-7 w-7 transition-transform duration-300",
          isCancel ? "rotate-45 text-rose-400/90" : "text-primary-foreground"
        )}
      />
    </div>
  )

  if (isCancel && onClick) {
    return (
      <button onClick={onClick} aria-label="Cancel and go back">
        {inner}
      </button>
    )
  }

  return (
    <Link href={href} aria-label="Post a mission">
      {inner}
    </Link>
  )
}
