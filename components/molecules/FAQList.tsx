'use client'

import { Accordion } from '@/components/ui/accordion'
import { FAQItem } from '@/components/molecules/FAQItem'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

const defaultValue = QUEST_CONFIG.council.faqs
  .filter((faq) => faq.defaultOpen)
  .map((faq) => faq.id)

export function FAQList() {
  return (
    <Accordion
      type="multiple"
      defaultValue={defaultValue}
      className="flex w-full flex-col gap-3"
    >
      {QUEST_CONFIG.council.faqs.map((faq) => (
        <FAQItem
          key={faq.id}
          id={faq.id}
          icon={faq.icon}
          question={faq.question}
          answer={faq.answer}
        />
      ))}
    </Accordion>
  )
}
