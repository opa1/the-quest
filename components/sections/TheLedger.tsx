import { ChapterLabel } from '@/components/atoms/ChapterLabel'
import { SectionTitle } from '@/components/atoms/SectionTitle'
import { TimelineDot } from '@/components/atoms/TimelineDot'
import { VerificationEmblem } from '@/components/atoms/VerificationEmblem'
import { TransactionCard } from '@/components/molecules/TransactionCard'
import { ChainStatusPanel } from '@/components/molecules/ChainStatusPanel'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export function TheLedger() {
  const { chapterLabel, title, subtext, transactions } = QUEST_CONFIG.ledger

  return (
    <section id="ledger" className="bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-10 py-32">
        <div className="flex flex-col items-center gap-4 text-center">
          <ChapterLabel label={chapterLabel} variant="text" decorated />
          <SectionTitle title={title} subtext={subtext} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[3fr_2fr]">
          {/* Left — transaction stack */}
          <div className="flex flex-col gap-6">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-start gap-4">
                <TimelineDot className="mt-5 shrink-0" />
                <TransactionCard {...tx} className="flex-1" />
              </div>
            ))}
          </div>

          {/* Right — chain status + verification emblem */}
          <div className="flex flex-col gap-4">
            <ChainStatusPanel />
            <div className="flex items-center justify-center rounded-[16px] border border-border/50 bg-card p-8">
              <VerificationEmblem />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
