import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, TriangleAlert } from "lucide-react"
import ProofTypeBadge from "@/components/atoms/ProofTypeBadge"
import SubmitProofForm from "@/components/molecules/SubmitProofForm"
import { competingLabel, isOversubscribed } from "@/lib/utils/claim-counts"
import { QUEST_CONFIG } from "@/lib/config/quest.config"

export const metadata = {
  title: "Submit Proof - The Quest",
}

interface SubmitPageProps {
  params: Promise<{ id: string }>
}

export default async function SubmitPage({ params }: SubmitPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const { data: task } = await supabase
    .from("tasks")
    .select("id, title, status, proof_type, created_by, max_claimers")
    .eq("id", id)
    .single()

  if (!task) redirect(`/tasks/${id}`)

  // Preconditions mirror submitWork — there is no claim step to hold, so the
  // only things standing between an operative and this form are the mission
  // being closed, it being their own, or their already having submitted.
  if (task.created_by === user.id) redirect(`/tasks/${id}`)
  if (task.status === "completed" || task.status === "cancelled")
    redirect(`/tasks/${id}`)

  const { data: claim } = await supabase
    .from("task_claims")
    .select("status")
    .eq("task_id", id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (claim?.status === "submitted" || claim?.status === "approved")
    redirect(`/tasks/${id}`)

  const { data: ban } = await supabase
    .from("task_bans")
    .select("id")
    .eq("task_id", id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (ban) redirect(`/tasks/${id}`)

  // Odds, shown before the work rather than after the rejection.
  const maxClaimers = task.max_claimers ?? 1
  const { data: contenders } = await supabase
    .from("task_claims")
    .select("id", { count: "exact" })
    .eq("task_id", id)
    .in("status", ["submitted", "approved"])
  const submissionCount = contenders?.length ?? 0
  const oversubscribed = isOversubscribed(submissionCount, maxClaimers)

  const proofType = (task.proof_type ?? "any") as
    | "url"
    | "text"
    | "image"
    | "any"

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <Link
        href={`/tasks/${id}`}
        className="flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {QUEST_CONFIG.submitProof.backLink}
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-black tracking-tight text-foreground uppercase">
          {QUEST_CONFIG.submitProof.title}
        </h1>
        <p className="text-sm text-muted-foreground">{task.title}</p>
        <div className="mt-1">
          <ProofTypeBadge proofType={proofType} />
        </div>
      </div>

      {oversubscribed && (
        <div className="flex items-start gap-2.5 rounded-[10px] border border-amber-800 bg-amber-950/40 px-4 py-3">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-amber-400">
              {competingLabel(submissionCount, maxClaimers)}
            </span>
            <span className="text-xs leading-relaxed text-muted-foreground">
              Long odds. Read the brief carefully before you spend time on this
              one — only {maxClaimers === 1 ? "one submission gets" : `${maxClaimers} submissions get`}{" "}
              paid.
            </span>
          </div>
        </div>
      )}

      <SubmitProofForm
        taskId={id}
        proofType={proofType}
        redirectTo={`/tasks/${id}`}
      />
    </div>
  )
}
