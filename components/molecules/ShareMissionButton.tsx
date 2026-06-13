"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Share2 } from "lucide-react"

interface ShareMissionButtonProps {
  taskId: string
  title?: string
}

export default function ShareMissionButton({
  taskId,
  title,
}: ShareMissionButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async (e: React.MouseEvent) => {
    // The button may live inside a clickable card — don't trigger navigation.
    e.preventDefault()
    e.stopPropagation()

    const url = `${window.location.origin}/tasks/${taskId}`

    // Use the native share sheet when available (mostly mobile).
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: title ?? "Check out this mission on The Quest",
          url,
        })
        return
      } catch {
        // User dismissed the share sheet (or it failed) — fall back to copy.
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable (e.g. insecure context) — nothing else to do.
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="border-primary/50 text-primary hover:border-primary hover:text-primary"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          <span className="text-xs font-bold tracking-widest uppercase">
            Link Copied
          </span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          <span className="text-xs font-bold tracking-widest uppercase">
            Share
          </span>
        </>
      )}
    </Button>
  )
}
