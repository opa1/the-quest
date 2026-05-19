import { ChapterLabel } from '@/components/atoms/ChapterLabel'
import { SectionTitle } from '@/components/atoms/SectionTitle'
import { ScrollReveal } from '@/components/atoms/ScrollReveal'
import { SectionWrapper } from '@/components/atoms/SectionWrapper'
import { TimelineDot } from '@/components/atoms/TimelineDot'
import { TransactionCard } from '@/components/molecules/TransactionCard'
import { ChainStatusPanel } from '@/components/molecules/ChainStatusPanel'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export function TheLedger() {
  const { chapterLabel, title, subtext, transactions } = QUEST_CONFIG.ledger

  return (
    <SectionWrapper id="the-ledger" className="bg-background" innerClassName="flex flex-col gap-12">
      <ScrollReveal className="flex flex-col items-center gap-4 text-center">
        <ChapterLabel label={chapterLabel} />
        <SectionTitle title={title} subtext={subtext} />
      </ScrollReveal>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-6">
          {transactions.map((tx, i) => (
            <ScrollReveal key={tx.id} direction="left" delay={i * 120}>
              <div className="flex items-start gap-4">
                <TimelineDot className="mt-5 shrink-0 hidden md:block" />
                <TransactionCard {...tx} className="flex-1" />
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal direction="right" delay={150}>
          <ChainStatusPanel />
        </ScrollReveal>
      </div>
    </SectionWrapper>
  )
}
