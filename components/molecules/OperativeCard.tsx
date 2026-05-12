import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OperativeBadge } from '@/components/atoms/OperativeBadge'
import { cn } from '@/lib/utils'

interface OperativeCardProps {
  name: string
  rank?: string
  tags?: readonly string[]
  image: string
  className?: string
}

export function OperativeCard({ name, rank, tags, image, className }: OperativeCardProps) {
  return (
    <div
      className={cn(
        'relative h-[400px] w-[260px] overflow-hidden rounded-[20px] border border-primary/30 shadow-2xl',
        className
      )}
    >
      <img
        src={image}
        alt={name}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      <Button
        size="icon"
        variant="outline"
        className="absolute right-3 top-3 rounded-full border-primary text-primary hover:border-primary hover:bg-primary/10"
      >
        <ArrowRight className="size-4" />
      </Button>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        {tags && tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <OperativeBadge key={tag} label={tag} />
            ))}
          </div>
        )}
        <p className="text-lg font-bold uppercase text-foreground">{name}</p>
        {rank && (
          <p className="text-xs text-muted-foreground">{rank}</p>
        )}
      </div>
    </div>
  )
}
