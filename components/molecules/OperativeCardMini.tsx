import { cn } from '@/lib/utils'

interface OperativeCardMiniProps {
  name: string
  image: string
  className?: string
}

export function OperativeCardMini({ name, image, className }: OperativeCardMiniProps) {
  return (
    <div
      className={cn(
        'relative h-[320px] w-[90px] overflow-hidden rounded-[16px] opacity-80',
        className
      )}
    >
      <img
        src={image}
        alt={name}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <p
        className="absolute bottom-4 left-[50%] text-[10px] font-semibold uppercase tracking-widest text-primary"
        style={{ writingMode: 'vertical-rl', transform: 'translateX(-50%) rotate(180deg)' }}
      >
        {name}
      </p>
    </div>
  )
}
