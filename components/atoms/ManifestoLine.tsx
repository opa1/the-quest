import { cn } from '@/lib/utils'

const sizeMap = {
  md: 'text-xl md:text-2xl',
  lg: 'text-2xl md:text-4xl',
  xl: 'text-3xl md:text-5xl',
} as const

type ManifestoSize = keyof typeof sizeMap

interface ManifestoLineProps {
  text: string
  size: string
  className?: string
}

export function ManifestoLine({ text, size, className }: ManifestoLineProps) {
  return (
    <p
      className={cn(
        'max-w-4xl text-center font-bold uppercase leading-tight tracking-tight text-foreground',
        sizeMap[size as ManifestoSize] ?? sizeMap.md,
        className
      )}
    >
      {text}
    </p>
  )
}
