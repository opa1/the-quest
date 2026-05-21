import dynamic from 'next/dynamic'
import dynamicIconImports from 'lucide-react/dynamicIconImports'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface RecordStatCardProps {
  iconName: string
  label: string
  value: string | number
  highlight?: boolean
  className?: string
}

export default function RecordStatCard({ iconName, label, value, highlight, className }: RecordStatCardProps) {
  const Icon = dynamic(dynamicIconImports[iconName as keyof typeof dynamicIconImports])

  return (
    <Card className={cn('bg-card border-border/40 rounded-[14px] px-6 py-5 flex flex-col gap-3', className)}>
      <Icon className="w-5 h-5 text-primary" />
      <span
        className={cn(
          'font-black leading-none',
          highlight ? 'text-3xl text-primary' : 'text-2xl text-foreground'
        )}
      >
        {value}
      </span>
      <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
        {label}
      </span>
    </Card>
  )
}
