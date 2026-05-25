'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth.store'
import { submitWork } from '@/app/actions/tasks'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

interface SubmitProofFormProps {
  taskId: string
  proofType: 'url' | 'text' | 'image' | 'any'
  redirectTo: string
}

const cfg = QUEST_CONFIG.submitProof

export default function SubmitProofForm({ taskId, proofType, redirectTo }: SubmitProofFormProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const [urls, setUrls] = useState<string[]>([''])
  const [notes, setNotes] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const showUrls  = proofType === 'url'   || proofType === 'any'
  const showText  = proofType === 'text'  || proofType === 'any'
  const showImage = proofType === 'image' || proofType === 'any'

  const handleUrlChange = (index: number, value: string) => {
    setUrls((prev) => prev.map((u, i) => (i === index ? value : u)))
  }

  const addUrl = () => {
    if (urls.length < 3) setUrls((prev) => [...prev, ''])
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setImageFile(file)
    setIsUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const path = `${taskId}/${user.id}/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('task-proofs')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('task-proofs')
        .getPublicUrl(path)

      setImageUrl(publicUrl)
    } catch {
      setError('Image upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    setError(null)

    const validUrls = urls.filter((u) => u.trim().startsWith('http'))

    if (proofType === 'url' && validUrls.length === 0) {
      setError('Please provide at least one valid URL starting with http.')
      return
    }
    if (proofType === 'text' && notes.trim().length < 20) {
      setError('Notes must be at least 20 characters.')
      return
    }
    if (proofType === 'image' && !imageUrl) {
      setError('Please upload an image.')
      return
    }
    if (proofType === 'any' && validUrls.length === 0 && notes.trim().length < 20 && !imageUrl) {
      setError('Please provide at least one form of proof.')
      return
    }

    setIsSubmitting(true)

    const result = await submitWork(taskId, {
      urls: validUrls.length > 0 ? validUrls : undefined,
      notes: notes.trim() || undefined,
      imageUrl: imageUrl ?? undefined,
    })

    if (result.error) {
      setError(result.message ?? 'Something went wrong. Please try again.')
      setIsSubmitting(false)
      return
    }

    router.push(redirectTo)
  }

  return (
    <div className="flex flex-col gap-6">

      {showUrls && (
        <div className="flex flex-col gap-2">
          <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
            {cfg.urlLabel}
          </Label>
          {urls.map((url, i) => (
            <Input
              key={i}
              value={url}
              onChange={(e) => handleUrlChange(i, e.target.value)}
              placeholder={cfg.urlPlaceholder}
              className="bg-muted/30 border-border/50 focus:border-primary font-mono text-sm"
            />
          ))}
          {urls.length < 3 && (
            <button
              type="button"
              onClick={addUrl}
              className="text-xs text-primary underline underline-offset-2 w-fit hover:opacity-80 transition-opacity"
            >
              {cfg.addUrlButton}
            </button>
          )}
        </div>
      )}

      {showText && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
              {cfg.notesLabel}
            </Label>
            <span className="text-xs text-muted-foreground tabular-nums">{notes.length}/1000</span>
          </div>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={cfg.notesPlaceholder}
            maxLength={1000}
            rows={5}
            className="bg-muted/30 border-border/50 focus:border-primary resize-none"
          />
        </div>
      )}

      {showImage && (
        <div className="flex flex-col gap-2">
          <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
            {cfg.imageLabel}
          </Label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isUploading}
            className="bg-muted/30 border-border/50 focus:border-primary text-sm file:text-xs file:uppercase file:tracking-widest file:font-bold file:text-muted-foreground file:border-0 file:bg-transparent"
          />
          {isUploading && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Uploading image...
            </p>
          )}
          {imageUrl && !isUploading && (
            <p className="text-xs text-green-400">Image uploaded successfully.</p>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-[10px] px-4 py-3">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive leading-snug">{error}</p>
        </div>
      )}

      <Button
        variant="default"
        size="lg"
        className="w-full"
        onClick={handleSubmit}
        disabled={isSubmitting || isUploading}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="uppercase tracking-widest text-sm font-bold">{cfg.submittingButton}</span>
          </>
        ) : (
          <span className="uppercase tracking-widest text-sm font-bold">{cfg.submitButton}</span>
        )}
      </Button>

    </div>
  )
}
