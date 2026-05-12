import { LeftSectionHeading } from '@/components/atoms/LeftSectionHeading'
import { ClassCard } from '@/components/molecules/ClassCard'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export function TheOrder() {
  return (
    <section id="order" className="bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-10 py-32">
        <LeftSectionHeading
          title={QUEST_CONFIG.order.title}
          subtext={QUEST_CONFIG.order.subtext}
        />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {QUEST_CONFIG.order.classes.map((cls) => (
            <ClassCard key={cls.id} {...cls} />
          ))}
        </div>
      </div>
    </section>
  )
}
