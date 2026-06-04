"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { uploadProofImage } from "@/app/actions/upload"
import { submitWork } from "@/app/actions/tasks"
import { QUEST_CONFIG } from "@/lib/config/quest.config"

interface SubmitProofFormProps {
  taskId: string
  proofType: "url" | "text" | "image" | "any"
  redirectTo: string
}

const cfg = QUEST_CONFIG.submitProof
const MAX_MB = parseFloat(process.env.NEXT_PUBLIC_MAX_PROOF_IMAGE_SIZE_MB ?? "5")

export default function SubmitProofForm({
  taskId,
  proofType,
  redirectTo,
}: SubmitProofFormProps) {
  const router = useRouter()
  const [urls, setUrls] = useState<string[]>([""])
  const [notes, setNotes] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)

  const showUrls = proofType === "url" || proofType === "any"
  const showText = proofType === "text" || proofType === "any"
  const showImage = proofType === "image" || proofType === "any"

  const handleUrlChange = (index: number, value: string) => {
    setUrls((prev) => prev.map((u, i) => (i === index ? value : u)))
  }

  const addUrl = () => {
    if (urls.length < 3) setUrls((prev) => [...prev, ""])
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageError(null)
    setImageUrl(null)

    if (file.size > MAX_MB * 1024 * 1024) {
      setImageError(cfg.imageTooLarge)
      e.target.value = ""
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      setImageError(cfg.imageInvalidType)
      e.target.value = ""
      return
    }

    setImageFile(file)
  }

  const handleSubmit = async () => {
    setError(null)

    const validUrls = urls.filter((u) => u.trim().startsWith("http"))

    if (proofType === "url" && validUrls.length === 0) {
      setError("Please provide at least one valid URL starting with http.")
      return
    }
    if (proofType === "text" && notes.trim().length < 20) {
      setError("Notes must be at least 20 characters.")
      return
    }
    if (proofType === "image" && !imageFile && !imageUrl) {
      setError("Please upload an image.")
      return
    }
    if (
      proofType === "any" &&
      validUrls.length === 0 &&
      notes.trim().length < 20 &&
      !imageFile &&
      !imageUrl
    ) {
      setError("Please provide at least one form of proof.")
      return
    }

    let finalImageUrl = imageUrl

    if (imageFile && !imageUrl) {
      setIsUploading(true)
      const fd = new FormData()
      fd.append("file", imageFile)
      const result = await uploadProofImage(fd)
      setIsUploading(false)

      if ("error" in result) {
        setImageError(result.message)
        if (proofType === "image") return
      } else {
        finalImageUrl = result.url
        setImageUrl(result.url)
      }
    }

    setIsSubmitting(true)

    const result = await submitWork(taskId, {
      urls: validUrls.length > 0 ? validUrls : undefined,
      notes: notes.trim() || undefined,
      imageUrl: finalImageUrl ?? undefined,
    })

    if (result.error) {
      setError(result.message ?? "Something went wrong. Please try again.")
      setIsSubmitting(false)
      return
    }

    router.push(redirectTo)
  }

  const sizeLabel = imageFile
    ? `${(imageFile.size / (1024 * 1024)).toFixed(2)} MB`
    : null

  return (
    <div className="flex flex-col gap-6">
      {showUrls && (
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            {cfg.urlLabel}
          </Label>
          {urls.map((url, i) => (
            <Input
              key={i}
              value={url}
              onChange={(e) => handleUrlChange(i, e.target.value)}
              placeholder={cfg.urlPlaceholder}
              className="border-border/50 bg-muted/30 font-mono text-sm focus:border-primary"
            />
          ))}
          {urls.length < 3 && (
            <button
              type="button"
              onClick={addUrl}
              className="w-fit text-xs text-primary underline underline-offset-2 transition-opacity hover:opacity-80"
            >
              {cfg.addUrlButton}
            </button>
          )}
        </div>
      )}

      {showText && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
              {cfg.notesLabel}
            </Label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {notes.length}/1000
            </span>
          </div>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={cfg.notesPlaceholder}
            maxLength={1000}
            rows={5}
            className="resize-none border-border/50 bg-muted/30 focus:border-primary"
          />
        </div>
      )}

      {showImage && (
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            {cfg.imageLabel}
          </Label>
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            disabled={isUploading}
            className="border-border/50 bg-muted/30 text-sm file:border-0 file:bg-transparent file:text-xs file:font-bold file:tracking-widest file:text-muted-foreground file:uppercase focus:border-primary"
          />
          {imageFile && !imageError && !imageUrl && !isUploading && (
            <p className="text-xs text-muted-foreground">
              {cfg.imageSelected}: {imageFile.name} ({sizeLabel})
            </p>
          )}
          {isUploading && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> {cfg.imageUploading}
            </p>
          )}
          {imageUrl && !isUploading && (
            <p className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle2 className="h-3 w-3" /> Image uploaded successfully.
            </p>
          )}
          {imageError && (
            <p className="text-xs text-destructive">{imageError}</p>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-[10px] border border-destructive/30 bg-destructive/10 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm leading-snug text-destructive">{error}</p>
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
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span className="text-sm font-bold tracking-widest uppercase">
              {cfg.submittingButton}
            </span>
          </>
        ) : (
          <span className="text-sm font-bold tracking-widest uppercase">
            {cfg.submitButton}
          </span>
        )}
      </Button>
    </div>
  )
}
