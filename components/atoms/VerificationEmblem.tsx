import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerificationEmblemProps {
  className?: string
}

const ORBIT_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

export function VerificationEmblem({ className }: VerificationEmblemProps) {
  return (
    <div className={cn('relative mx-auto flex h-48 w-48 items-center justify-center', className)}>
      {/* Outer decorative ring */}
      <div className="absolute inset-4 rounded-full border border-primary/10" />

      {/* Orbiting dots */}
      {ORBIT_ANGLES.map((angle) => (
        <span
          key={angle}
          className="absolute h-1.5 w-1.5 rounded-full bg-primary/40"
          style={{
            transform: `rotate(${angle}deg) translateY(-56px)`,
            top: '50%',
            left: '50%',
            marginTop: '-3px',
            marginLeft: '-3px',
          }}
        />
      ))}

      {/* Center circle */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/60 bg-muted shadow-[0_0_24px_oklch(0.795_0.184_86.047/0.25)]">
        <ShieldCheck className="h-8 w-8 text-primary" />
      </div>
    </div>
  )
}
