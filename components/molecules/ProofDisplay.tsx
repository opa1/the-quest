'use client'

import { ExternalLink } from 'lucide-react'
import UserAvatar from '@/components/atoms/UserAvatar'
import type { ProofUrl } from '@/lib/types/missions'

interface ProofDisplayProps {
  task: {
    proof_type: string
    proof_notes: string | null
    proof_image_url: string | null
    claimer: { username: string | null; avatar_url: string | null }
  }
  proofUrls: ProofUrl[]
}

export default function ProofDisplay({ task, proofUrls }: ProofDisplayProps) {
  const { claimer } = task
  const hasContent = task.proof_notes || task.proof_image_url || proofUrls.length > 0

  return (
    <div className="border-l-2 border-primary/50 bg-card rounded-r-[16px] p-6 flex flex-col gap-5">

      {/* Submitted by */}
      <div className="flex items-center gap-3">
        <UserAvatar src={claimer.avatar_url} username={claimer.username ?? 'Unknown'} size="sm" />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            Submitted by
          </span>
          <span className="text-sm font-bold text-foreground">
            @{claimer.username ?? 'Unknown'}
          </span>
        </div>
      </div>

      {!hasContent && (
        <p className="text-sm text-muted-foreground italic">No proof content submitted.</p>
      )}

      {/* URLs */}
      {proofUrls.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            Submitted Links
          </span>
          <div className="flex flex-col gap-1.5">
            {proofUrls.map((p) => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-primary underline underline-offset-2 hover:opacity-80 transition-opacity font-mono truncate"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                {p.url}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {task.proof_notes && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            Notes
          </span>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-muted/20 rounded-[10px] px-4 py-3">
            {task.proof_notes}
          </p>
        </div>
      )}

      {/* Image */}
      {task.proof_image_url && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            Image
          </span>
          <a href={task.proof_image_url} target="_blank" rel="noopener noreferrer">
            <img
              src={task.proof_image_url}
              alt="Submitted proof"
              className="rounded-[10px] max-h-[320px] object-cover border border-border/40 hover:opacity-90 transition-opacity cursor-pointer"
            />
          </a>
        </div>
      )}

    </div>
  )
}
