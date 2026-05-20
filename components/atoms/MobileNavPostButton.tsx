import Link from "next/link"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileNavPostButtonProps {
  href: string
  className?: string
}

export default function MobileNavPostButton({
  href,
  className,
}: MobileNavPostButtonProps) {
  return (
    <Link href={href} aria-label="Post a mission">
      <div
        className={cn(
          "h-16 w-16 rounded-full border-4 border-background bg-primary",
          "flex items-center justify-center",
          // 'shadow-[0_0_24px_oklch(0.795_0.184_86.047/0.5)]',
          "transition-colors duration-200 hover:bg-primary/90",
          className
        )}
      >
        <Plus className="h-7 w-7 text-primary-foreground" />
      </div>
    </Link>
  )
}
