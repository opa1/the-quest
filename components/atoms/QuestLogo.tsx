import Image from "next/image"
import { cn } from "@/lib/utils"

interface QuestLogoProps {
  className?: string
}

export function QuestLogo({ className }: QuestLogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/images/logo.webp"
        alt="The Quest logo"
        width={40}
        height={40}
        sizes="(max-width: 768px) 28px, (max-width: 1024px) 32px, 40px"
        className="size-7 shrink-0 object-contain md:size-8 lg:size-10"
      />
      <span className="font-heading text-lg font-black tracking-widest text-primary uppercase md:text-xl lg:text-2xl">
        THE QUEST
      </span>
    </span>
  )
}
