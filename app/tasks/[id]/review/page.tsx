import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getActiveNetwork } from '@/lib/config/network.server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import UserAvatar from '@/components/atoms/UserAvatar'
import TimeAgo from '@/components/atoms/TimeAgo'
import ProofDisplay from '@/components/molecules/ProofDisplay'
import ReviewSubmissionPanel from '@/components/molecules/ReviewSubmissionPanel'
import { getTaskProofs } from '@/app/actions/submissions'
import { markTaskNotificationsRead } from '@/app/actions/tasks'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export const metadata = {
  title: 'Review Submission - The Quest',
}

interface ReviewPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ claim?: string }>
}

type ClaimerProfile = { username: string | null; avatar_url: string | null }

export default async function ReviewPage({ params, searchParams }: ReviewPageProps) {
  const { id } = await params
  const { claim: claimIdParam } = await searchParams
  const supabase = await createClient()
  const admin = createAdminClient(await getActiveNetwork())

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  await markTaskNotificationsRead(id)

  const { data: task } = await supabase
    .from('tasks')
    .select('id, title, proof_type, created_by')
    .eq('id', id)
    .single()

  if (!task) redirect(`/tasks/${id}`)
  if (task.created_by !== user.id) redirect(`/tasks/${id}`)

  const proofType = task.proof_type ?? 'any'

  // Fetch every submitted claim on this mission (poster's own task).
  const { data: submittedClaims } = await admin
    .from('task_claims')
    .select('id, user_id, status, proof_notes, proof_image_url, submitted_at')
    .eq('task_id', id)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: true })

  const claims = submittedClaims ?? []
  if (claims.length === 0) redirect(`/tasks/${id}`)

  // Resolve claimer profiles in one round trip.
  const claimerIds = [...new Set(claims.map((c) => c.user_id).filter(Boolean))]
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', claimerIds)

  const profileMap = new Map<string, ClaimerProfile>(
    (profiles ?? []).map((p) => [p.id, { username: p.username, avatar_url: p.avatar_url }])
  )

  // Pick the claim to review: the requested one, or the only one when solo.
  const activeClaim =
    claims.find((c) => c.id === claimIdParam) ??
    (claims.length === 1 ? claims[0] : null)

  const backLink = (
    <Link
      href={`/tasks/${id}`}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
    >
      <ArrowLeft className="w-4 h-4" />
      {QUEST_CONFIG.reviewPanel.backLink}
    </Link>
  )

  // No specific claim selected and several are waiting — show the queue.
  if (!activeClaim) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        {backLink}

        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black uppercase text-foreground font-heading tracking-tight">
            {QUEST_CONFIG.reviewPanel.title}
          </h1>
          <p className="text-sm text-muted-foreground">{task.title}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {claims.length} submissions awaiting review
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {claims.map((c) => {
            const claimer = profileMap.get(c.user_id) ?? { username: null, avatar_url: null }
            return (
              <Link
                key={c.id}
                href={`/tasks/${id}/review?claim=${c.id}`}
                className="flex items-center justify-between gap-3 border border-border/40 rounded-[14px] p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar src={claimer.avatar_url} username={claimer.username ?? 'Unknown'} size="sm" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">
                      @{claimer.username ?? 'Unknown'}
                    </span>
                    {c.submitted_at && (
                      <TimeAgo date={c.submitted_at} className="text-xs text-muted-foreground" />
                    )}
                  </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary shrink-0">
                  Review →
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  const claimer = profileMap.get(activeClaim.user_id) ?? { username: null, avatar_url: null }
  const proofUrls = await getTaskProofs(id, activeClaim.user_id)
  const multiple = claims.length > 1

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      {multiple ? (
        <Link
          href={`/tasks/${id}/review`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all submissions
        </Link>
      ) : (
        backLink
      )}

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black uppercase text-foreground font-heading tracking-tight">
          {QUEST_CONFIG.reviewPanel.title}
        </h1>
        <p className="text-sm text-muted-foreground">{task.title}</p>
      </div>

      <ProofDisplay
        task={{
          proof_type: proofType,
          proof_notes: activeClaim.proof_notes,
          proof_image_url: activeClaim.proof_image_url,
          claimer,
        }}
        proofUrls={proofUrls}
      />

      <div className="border border-border/40 rounded-[16px] p-6">
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
          Your Decision
        </h2>
        <ReviewSubmissionPanel
          taskId={id}
          claimId={activeClaim.id}
          claimerId={activeClaim.user_id ?? ''}
          claimer={claimer}
          redirectTo={multiple ? `/tasks/${id}/review` : `/tasks/${id}`}
        />
      </div>
    </div>
  )
}
