import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  src: string | null
  username: string
  size?: 'sm' | 'md'
  className?: string
}

export default function UserAvatar({ src, username, size = 'md', className }: UserAvatarProps) {
  return (
    <Avatar
      className={cn(
        'border-2 border-primary/40',
        size === 'sm' ? 'w-8 h-8' : 'w-10 h-10',
        className
      )}
    >
      <AvatarImage src={src ?? undefined} alt={username} />
      <AvatarFallback className="bg-muted text-primary font-bold uppercase">
        {username.charAt(0)}
      </AvatarFallback>
    </Avatar>
  )
}
