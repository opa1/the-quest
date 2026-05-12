import { type LucideIcon, Orbit, Cpu, ShieldCheck, Zap, Star, Shield, Sword, Target, Globe, Lock, Code, Brain, Eye, Flame, Megaphone, Coins, ScrollText, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, LucideIcon> = {
  Orbit,
  Cpu,
  ShieldCheck,
  Zap,
  Star,
  Shield,
  Sword,
  Target,
  Globe,
  Lock,
  Code,
  Brain,
  Eye,
  Flame,
  Megaphone,
  Coins,
  ScrollText,
  Trophy,
}

interface FeatureIconProps {
  iconName: string
  className?: string
}

export function FeatureIcon({ iconName, className }: FeatureIconProps) {
  const Icon = ICON_MAP[iconName]

  return (
    <div
      className={cn(
        'flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/60 bg-muted shadow-[0_0_12px_oklch(0.795_0.184_86.047/0.2)]',
        className
      )}
    >
      {Icon && <Icon className="h-6 w-6 text-primary" />}
    </div>
  )
}
