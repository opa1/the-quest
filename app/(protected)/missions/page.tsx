import MissionsFilterBar from '@/components/molecules/MissionsFilterBar'
import MissionsGrid from '@/components/molecules/MissionsGrid'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export const metadata = {
  title: 'Missions | The Quest',
  description: 'Browse all open missions on The Quest. Claim a bounty and start building your legacy.',
}

export default function MissionsPage() {
  return (
    <div className="flex flex-col gap-8">

      {/* Page heading */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-black uppercase text-foreground font-heading tracking-tight">
          {QUEST_CONFIG.missions.title}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          {QUEST_CONFIG.missions.subtext}
        </p>
      </div>

      {/* Filter bar */}
      <MissionsFilterBar />

      {/* Mission grid */}
      <MissionsGrid />

    </div>
  )
}
