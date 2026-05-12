'use client'

import { useEffect, useRef, useState } from 'react'
import { ChapterLabel } from '@/components/atoms/ChapterLabel'
import { SectionTitle } from '@/components/atoms/SectionTitle'
import { ScrollReveal } from '@/components/atoms/ScrollReveal'
import { SectionWrapper } from '@/components/atoms/SectionWrapper'
import { StepNumber } from '@/components/atoms/StepNumber'
import { GuildStepCard } from '@/components/molecules/GuildStepCard'
import { Button } from '@/components/ui/button'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export function Guild() {
  const { chapterLabel, title, subtext, ctaLabel, ctaHref, steps } = QUEST_CONFIG.guild
  const stepsRef = useRef<HTMLDivElement>(null)
  const [activeCount, setActiveCount] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!stepsRef.current) return
      const rect = stepsRef.current.getBoundingClientRect()
      const windowH = window.innerHeight
      const progress = Math.max(0, Math.min(1, (windowH - rect.top) / (windowH * 0.8)))

      if (progress >= 0.85) setActiveCount(3)
      else if (progress >= 0.45) setActiveCount(2)
      else if (progress >= 0.1) setActiveCount(1)
      else setActiveCount(0)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fillPercent = Math.max(0, ((activeCount - 1) / (steps.length - 1)) * 100)

  return (
    <SectionWrapper id="guild" className="bg-background" innerClassName="flex flex-col gap-12">
      <ScrollReveal className="flex flex-col items-center gap-4 text-center">
        <ChapterLabel label={chapterLabel} />
        <SectionTitle title={title} subtext={subtext} />
      </ScrollReveal>

      <div ref={stepsRef} className="relative mt-4">

        {/* ── Mobile: single column, number beside card, no line ── */}
        <div className="flex flex-col gap-5 lg:hidden">
          {steps.map((step, i) => (
            <div key={step.id} className="relative flex  items-start gap-4">
              <StepNumber number={step.number} active={i < activeCount} className="mt-1 shrink-0 absolute right-4 top-2" />
              <GuildStepCard {...step} active={i < activeCount} className="flex-1" />
            </div>
          ))}
        </div>

        {/* ── Desktop: horizontal row with connector line ── */}
        <div className="hidden lg:block">
          {/* Connector line */}
          <div className="absolute top-8 right-[16.67%] left-[16.67%] z-0 h-px overflow-hidden bg-border/40">
            <div
              className="h-full bg-primary transition-[width] duration-700 ease-out"
              style={{ width: `${fillPercent}%` }}
            />
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={step.id} className="flex justify-center">
                <StepNumber number={step.number} active={i < activeCount} />
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <GuildStepCard key={step.id} {...step} active={i < activeCount} />
            ))}
          </div>
        </div>

      </div>

      <ScrollReveal delay={200} className="flex justify-center">
        <Button variant="outline" size="lg" asChild>
          <a href={ctaHref}>
            <span className="text-sm uppercase tracking-widest">{ctaLabel}</span>
          </a>
        </Button>
      </ScrollReveal>
    </SectionWrapper>
  )
}
