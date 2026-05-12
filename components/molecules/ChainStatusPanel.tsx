import { Link2, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ChainStatRow } from '@/components/atoms/ChainStatRow'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export function ChainStatusPanel() {
  const { network, totalRepMinted, activeContracts, ctaLabel } =
    QUEST_CONFIG.ledger.chainStatus

  return (
    <Card className="flex flex-col gap-5 rounded-[16px] border border-border/50 bg-card p-6">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          CHAIN STATUS
        </span>
      </div>

      <Separator className="bg-border/50" />

      <ChainStatRow label="Network" value={network} />
      <ChainStatRow
        label="Total Rep Minted"
        value={`${totalRepMinted} REP`}
        valueHighlight
      />
      <ChainStatRow label="Active Contracts" value={String(activeContracts)} />

      <Separator className="bg-border/50" />

      <Button variant="outline" className="w-full">
        {ctaLabel}
        <ExternalLink className="ml-2 h-4 w-4" />
      </Button>
    </Card>
  )
}
