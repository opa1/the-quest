import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FeatureIcon } from '@/components/atoms/FeatureIcon'
import { GuardedLink } from '@/components/atoms/GuardedLink'
import { DISCORD_INVITE } from '@/lib/config/quest.config'
import { HOW_IT_WORKS } from '@/lib/config/how-it-works.config'

export const metadata: Metadata = {
  title: 'How It Works | The Quest',
  description:
    'How The Quest works: claim a mission, do the work, submit proof, get paid in ADA, and build an on-chain reputation.',
}

export default function HowItWorksPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-20 px-5 py-16 sm:px-8 lg:px-10">
      {/* ── Intro ── */}
      <header className="flex flex-col gap-4">
        <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
          How It Works
        </span>
        <h1 className="font-heading text-4xl font-black tracking-tight text-foreground uppercase md:text-6xl">
          {HOW_IT_WORKS.intro.headline}
        </h1>
        <p className="max-w-2xl border-l-2 border-primary pl-4 text-base leading-relaxed text-muted-foreground">
          {HOW_IT_WORKS.intro.body}
        </p>
      </header>

      {/* ── The loop ── */}
      <section id="the-loop" className="flex scroll-mt-24 flex-col gap-8">
        <SectionLead
          title="The Loop"
          lead="Five steps, start to finish. That's the whole platform."
        />
        <ol className="flex flex-col gap-4">
          {HOW_IT_WORKS.steps.map((step, i) => (
            <li key={step.id}>
              <Card className="flex flex-row items-start gap-5 rounded-[16px] border border-border/50 bg-muted/40 p-6">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-heading text-sm font-black text-primary">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg leading-snug font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Rewards (Arsenal's "Earn ADA + XP" card links straight here) ── */}
      <section id="rewards" className="flex scroll-mt-24 flex-col gap-8">
        <SectionLead
          title="Rewards"
          lead="How ADA actually reaches your wallet, and what XP is for."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {HOW_IT_WORKS.rewards.map((item) => (
            <Card
              key={item.id}
              className="flex h-full flex-col gap-0 rounded-[16px] border border-border/50 bg-muted/40 p-6"
            >
              <FeatureIcon iconName={item.icon} />
              <h3 className="mt-5 text-base font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Reputation ── */}
      <section id="reputation" className="flex scroll-mt-24 flex-col gap-6">
        <SectionLead
          title="On-Chain Reputation"
          lead="Why any of this is worth more than a number in our database."
        />
        <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
          {HOW_IT_WORKS.reputation.map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="flex scroll-mt-24 flex-col gap-6">
        <SectionLead title="FAQ" lead="The questions we get asked most." />
        <div className="flex flex-col gap-3">
          {HOW_IT_WORKS.faq.map((item) => (
            <details
              key={item.q}
              className="group rounded-[14px] border border-border/50 bg-muted/40 p-5 transition-colors duration-200 hover:border-primary/30"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-foreground [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <Separator className="my-4 bg-border/50" />
              <p className="text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Close ── */}
      <section className="flex flex-col items-center gap-6 rounded-[16px] border border-border/50 bg-muted/40 px-6 py-12 text-center">
        <h2 className="font-heading text-2xl font-black tracking-tight text-foreground uppercase md:text-3xl">
          Still have questions?
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          The fastest way to get an answer is to ask in the Discord. Otherwise, the
          board is right there.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <GuardedLink href="/missions">
              <span className="text-sm font-bold tracking-widest uppercase">
                Browse Missions
              </span>
            </GuardedLink>
          </Button>
          <Button variant="outline" asChild>
            <Link href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
              <span className="text-sm font-bold tracking-widest uppercase">
                Ask On Discord
              </span>
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

function SectionLead({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-heading text-2xl font-black tracking-tight text-foreground uppercase md:text-3xl">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground">{lead}</p>
    </div>
  )
}
