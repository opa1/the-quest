import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  topLine: string
  bottomLine: string
  className?: string
}

export function SectionHeading({
  topLine,
  bottomLine,
  className,
}: SectionHeadingProps) {
  return (
    <h1
      className={cn(
        "font-heading leading-none font-black uppercase",
        className
      )}
    >
      <span className="block text-6xl text-foreground md:text-6xl lg:text-7xl xl:text-8xl">
        {topLine}
      </span>
      <span className="block text-6xl text-primary md:text-6xl lg:text-7xl xl:text-8xl">
        {bottomLine}
      </span>
    </h1>
  )
}
