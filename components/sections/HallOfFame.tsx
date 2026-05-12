import { ChapterLabel } from '@/components/atoms/ChapterLabel'
import { SectionTitle } from '@/components/atoms/SectionTitle'
import { PodiumFeatured } from '@/components/molecules/PodiumFeatured'
import { PodiumStandard } from '@/components/molecules/PodiumStandard'
import { LeaderboardTable } from '@/components/molecules/LeaderboardTable'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export function HallOfFame() {
  const { chapterLabel, title, subtext, topThree } = QUEST_CONFIG.hallOfFame

  return (
    <section id="hall-of-fame" className="bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-10 py-32">
        <div className="flex flex-col items-center gap-4 text-center">
          <ChapterLabel label={chapterLabel} variant="text" decorated />
          <SectionTitle title={title} subtext={subtext} />
        </div>

        <div className="mt-4 grid grid-cols-1 items-start gap-8 lg:grid-cols-[2fr_3fr]">
          {/* Left — podium stack */}
          <div className="flex flex-col gap-4">
            <PodiumFeatured {...topThree[0]} />
            <div className="grid grid-cols-2 gap-4">
              <PodiumStandard {...topThree[1]} />
              <PodiumStandard {...topThree[2]} />
            </div>
          </div>

          {/* Right — leaderboard table */}
          <LeaderboardTable />
        </div>
      </div>
    </section>
  )
}
