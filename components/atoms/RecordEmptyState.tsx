import { ScrollText } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { cn } from '@/lib/utils'

interface RecordEmptyStateProps {
  className?: string
}

export default function RecordEmptyState({ className }: RecordEmptyStateProps) {
  const { emptyState } = QUEST_CONFIG.record

  return (
    <div className={cn('flex flex-col items-center gap-4 py-24', className)}>
      <ScrollText className="w-10 h-10 text-muted-foreground mx-auto" />
      <p className="text-lg font-bold text-foreground text-center">{emptyState.title}</p>
      <p className="text-sm text-muted-foreground text-center">{emptyState.subtext}</p>
      <Button variant="default" size="lg" asChild>
        <Link href={emptyState.ctaHref}>
          <span className="uppercase tracking-widest text-sm font-bold">{emptyState.ctaLabel}</span>
        </Link>
      </Button>
    </div>
  )
}
