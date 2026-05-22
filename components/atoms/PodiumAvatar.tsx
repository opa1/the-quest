import UserAvatar from '@/components/atoms/UserAvatar'
import { cn } from '@/lib/utils'

interface PodiumAvatarProps {
  src: string | null
  username: string
  rank: number
  size?: 'sm' | 'md'
  className?: string
}

const crownColor: Record<number, string> = {
  1: 'bg-amber-400 text-black',
  2: 'bg-slate-300 text-black',
  3: 'bg-orange-400 text-black',
}

export default function PodiumAvatar({ src, username, rank, size = 'md', className }: PodiumAvatarProps) {
  return (
    <div className={cn('relative inline-flex', className)}>
      <UserAvatar src={src} username={username} size={size} />
      <span
        className={cn(
          'absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black',
          crownColor[rank] ?? 'bg-muted text-foreground'
        )}
      >
        {rank}
      </span>
    </div>
  )
}
