import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RecordStatsStrip from '@/components/molecules/RecordStatsStrip'
import ContributionList from '@/components/molecules/ContributionList'
import ProfileCard from '@/components/molecules/ProfileCard'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import type { ContributionRecord, RecordStats, UserProfile } from '@/lib/types/missions'

export const metadata = {
  title: 'My Record | The Quest',
  description: 'Your permanent on-chain contribution history on The Quest.',
}

export default async function RecordPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, credits, wallet_address, x_handle, created_at, onboarded')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/')

  const { data: logs } = await supabase
    .from('task_logs')
    .select(`
      id,
      cardano_tx_hash,
      created_at,
      tasks (
        id,
        title,
        category,
        difficulty,
        reward_credits,
        completed_at
      )
    `)
    .eq('user_id', user.id)
    .eq('action', 'completed')
    .order('created_at', { ascending: false })

  const records: ContributionRecord[] = (logs ?? []).map((log) => ({
    id: log.id,
    task_id: (log.tasks as any)?.id ?? '',
    task_title: (log.tasks as any)?.title ?? 'Unknown Task',
    category: (log.tasks as any)?.category ?? '',
    difficulty: (log.tasks as any)?.difficulty ?? 'easy',
    reward_credits: (log.tasks as any)?.reward_credits ?? 0,
    completed_at: log.created_at,
    cardano_tx_hash: log.cardano_tx_hash,
  }))

  const stats: RecordStats = {
    completed: records.length,
    credits: profile.credits ?? 0,
    rank: '',
    proofs: records.filter((r) => r.cardano_tx_hash !== null).length,
  }

  const userProfile: UserProfile = {
    id: profile.id,
    username: profile.username,
    avatar_url: profile.avatar_url,
    credits: profile.credits ?? 0,
    wallet_address: profile.wallet_address,
    x_handle: profile.x_handle,
    created_at: profile.created_at,
    onboarded: profile.onboarded,
  }

  return (
    <div className="flex flex-col gap-8">

      {/* Page heading */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-black uppercase text-foreground font-heading tracking-tight">
          {QUEST_CONFIG.record.title}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {QUEST_CONFIG.record.subtext}
        </p>
      </div>

      {/* Stats strip */}
      <RecordStatsStrip stats={stats} />

      {/* Two column */}
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-8 lg:items-start">

        {/* Left — contribution list */}
        <div className="flex-1 min-w-0">
          <ContributionList records={records} />
        </div>

        {/* Right — profile card */}
        <div className="w-full lg:w-[300px] lg:shrink-0">
          <ProfileCard profile={userProfile} />
        </div>

      </div>

    </div>
  )
}
