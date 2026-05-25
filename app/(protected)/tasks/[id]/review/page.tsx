import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ProofDisplay from '@/components/molecules/ProofDisplay'
import ReviewSubmissionPanel from '@/components/molecules/ReviewSubmissionPanel'
import { getTaskProofs } from '@/app/actions/submissions'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export const metadata = {
  title: 'Review Submission | The Quest',
}

interface ReviewPageProps {
  params: Promise<{ id: string }>
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: task } = await supabase
    .from('tasks')
    .select(`
      id, title, status, created_by,
      proof_type, proof_notes, proof_image_url,
      claimer:profiles!tasks_claimed_by_fkey(username, avatar_url),
      claimed_by
    `)
    .eq('id', id)
    .single()

  if (!task) redirect(`/tasks/${id}`)
  if (task.created_by !== user.id) redirect(`/tasks/${id}`)
  if (task.status !== 'submitted') redirect(`/tasks/${id}`)

  const claimer = Array.isArray(task.claimer) ? task.claimer[0] : task.claimer
  const proofUrls = await getTaskProofs(id)

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">

      <Link
        href={`/tasks/${id}`}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        {QUEST_CONFIG.reviewPanel.backLink}
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black uppercase text-foreground font-heading tracking-tight">
          {QUEST_CONFIG.reviewPanel.title}
        </h1>
        <p className="text-sm text-muted-foreground">{task.title}</p>
      </div>

      <ProofDisplay
        task={{
          proof_type: task.proof_type ?? 'any',
          proof_notes: task.proof_notes,
          proof_image_url: task.proof_image_url,
          claimer: claimer ?? { username: null, avatar_url: null },
        }}
        proofUrls={proofUrls}
      />

      <div className="border border-border/40 rounded-[16px] p-6">
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
          Your Decision
        </h2>
        <ReviewSubmissionPanel
          taskId={id}
          claimerId={task.claimed_by ?? ''}
          claimer={claimer ?? { username: null, avatar_url: null }}
          redirectTo={`/tasks/${id}`}
        />
      </div>

    </div>
  )
}
