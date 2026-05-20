import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import UserAvatar from '@/components/atoms/UserAvatar'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

interface TopQuestersProps {
  questers: Array<{
    rank: number
    username: string
    xp: number
    avatar: string | null
  }>
}

export default function TopQuesters({ questers }: TopQuestersProps) {
  return (
    <Card className="bg-card border-border/40 rounded-[14px] p-5 flex flex-col gap-3">
      <span className="text-[10px] uppercase tracking-widest font-semibold text-primary">
        {QUEST_CONFIG.realm.rightPanel.topQuestersTitle}
      </span>
      {questers.map((quester, i) => (
        <div key={quester.username}>
          <div className="flex items-center gap-3 py-1">
            <span className="text-xs font-bold text-muted-foreground w-5">
              {String(quester.rank).padStart(2, '0')}
            </span>
            <UserAvatar src={quester.avatar} username={quester.username} size="sm" />
            <span className="text-sm font-semibold text-foreground flex-1 truncate">
              @{quester.username}
            </span>
            <span className="text-xs font-bold text-primary">
              {quester.xp.toLocaleString()}
            </span>
          </div>
          {i < questers.length - 1 && <Separator className="mt-1" />}
        </div>
      ))}
    </Card>
  )
}
