import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PodiumAvatarProps {
  src: string | null
  username: string
  size?: 'lg' | 'sm'
  ringClass?: string
  className?: string
}

export function PodiumAvatar({
  src,
  username,
  size = 'sm',
  ringClass,
  className,
}: PodiumAvatarProps) {
  const sizeClass = size === 'lg' ? 'h-24 w-24' : 'h-16 w-16'
  const isPrimary = ringClass === 'border-primary'

  return (
    <div
      className={cn(
        'rounded-full border-2 p-0.5',
        ringClass ?? 'border-transparent',
        isPrimary && 'shadow-[0_0_16px_oklch(0.795_0.184_86.047/0.3)]',
        sizeClass,
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={username}
          className="h-full w-full rounded-full object-cover object-top"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
          <User className="h-1/2 w-1/2 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
