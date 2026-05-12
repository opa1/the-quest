import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { OperativeCard } from '@/components/molecules/OperativeCard'
import { OperativeCardMini } from '@/components/molecules/OperativeCardMini'

export function OperativeStack() {
  const featured = QUEST_CONFIG.operatives.find((o) => o.featured)
  const others = QUEST_CONFIG.operatives.filter((o) => !o.featured)

  return (
    <div className="relative h-[460px] w-[380px]">
      {others[1] && (
        <div className="absolute bottom-0 left-0 z-[1]">
          <OperativeCardMini name={others[1].name} image={others[1].image} />
        </div>
      )}

      {others[0] && (
        <div className="absolute bottom-0 left-[70px] z-[5]">
          <OperativeCardMini name={others[0].name} image={others[0].image} />
        </div>
      )}

      {featured && (
        <div className="absolute bottom-0 right-0 z-10">
          <OperativeCard
            name={featured.name}
            rank={'rank' in featured ? featured.rank : undefined}
            tags={'tags' in featured ? featured.tags : undefined}
            image={featured.image}
          />
        </div>
      )}
    </div>
  )
}
