import { BountyCard } from '@/components/molecules/BountyCard'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import type { PostMissionForm } from '@/lib/types/missions'

interface MissionPreviewProps {
  form: PostMissionForm
  xp?: number
}

export default function MissionPreview({ form, xp }: MissionPreviewProps) {
  const { previewTitle, previewSubtext } = QUEST_CONFIG.postMission

  const title = form.title.trim() || 'Your mission title will appear here'
  const description = form.description.trim() || 'Your mission brief will appear here...'
  const category = form.category || 'DESIGN'
  const difficulty = form.difficulty.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD'
  const adaReward = form.ada_reward > 0 ? Math.round(form.ada_reward * 1_000_000) : undefined

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
          {previewTitle}
        </span>
        <span className="text-xs text-muted-foreground">{previewSubtext}</span>
      </div>
      <BountyCard
        id="preview"
        category={category}
        difficulty={difficulty}
        title={title}
        description={description}
        xp={xp ?? 0}
        adaReward={adaReward}
        proofType={form.proof_type}
        featured={false}
      />
    </div>
  )
}
