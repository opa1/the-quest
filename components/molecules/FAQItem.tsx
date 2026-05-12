import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { FAQIcon } from '@/components/atoms/FAQIcon'
import { cn } from '@/lib/utils'

interface FAQItemProps {
  id: string
  icon: string
  question: string
  answer: string
  className?: string
}

export function FAQItem({ id, icon, question, answer, className }: FAQItemProps) {
  return (
    <AccordionItem
      value={id}
      className={cn(
        'overflow-hidden rounded-[14px] border border-border/50 bg-muted/40 px-6',
        className
      )}
    >
      <AccordionTrigger className="py-5 hover:no-underline">
        <div className="flex items-center gap-3">
          <FAQIcon iconName={icon} />
          <span className="text-left text-sm font-bold uppercase tracking-widest text-primary">
            {question}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <p className="max-w-3xl pb-5 pt-1 text-sm leading-relaxed text-muted-foreground">
          {answer}
        </p>
      </AccordionContent>
    </AccordionItem>
  )
}
