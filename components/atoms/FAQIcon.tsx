import dynamic from 'next/dynamic'
import dynamicIconImports from 'lucide-react/dynamicIconImports'
import { cn } from '@/lib/utils'

interface FAQIconProps {
  iconName: string
  className?: string
}

export function FAQIcon({ iconName, className }: FAQIconProps) {
  const Icon = dynamic(dynamicIconImports[iconName as keyof typeof dynamicIconImports])

  return <Icon className={cn('h-5 w-5 shrink-0 text-primary', className)} />
}
