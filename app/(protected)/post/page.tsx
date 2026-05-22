import PostMissionForm from '@/components/molecules/PostMissionForm'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export const metadata = {
  title: 'Post a Mission | The Quest',
  description: 'Deploy a new mission on The Quest.',
}

export default function PostPage() {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-black uppercase text-foreground font-heading tracking-tight">
          {QUEST_CONFIG.postMission.title}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {QUEST_CONFIG.postMission.subtext}
        </p>
      </div>
      <PostMissionForm />
    </div>
  )
}
