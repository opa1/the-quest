import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ProofTypeBadge from "@/components/atoms/ProofTypeBadge"
import SubmitProofForm from "@/components/molecules/SubmitProofForm"
import { QUEST_CONFIG } from "@/lib/config/quest.config"

export const metadata = {
  title: "Submit Proof | The Quest",
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
    .select("id, title, status, claimed_by, proof_type, created_by")
    .eq("id", id)
    .single()

  if (!task) redirect(`/tasks/${id}`)
  if (task.claimed_by !== user.id) redirect(`/tasks/${id}`)
  if (task.status !== "claimed") redirect(`/tasks/${id}`)

  const { data: ban } = await supabase
    .from("task_bans")
    .select("id")
    .eq("task_id", id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (ban) redirect(`/tasks/${id}`)

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

      <SubmitProofForm
        taskId={id}
        proofType={proofType}
        redirectTo={`/tasks/${id}`}
      />
    </div>
  )
}
