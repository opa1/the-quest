'use client'

import { useState, useCallback } from 'react'
import { ExternalLink, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
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

  const [imageLoaded, setImageLoaded] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [zoom, setZoom] = useState(1)

  const openViewer = () => {
    setZoom(1)
    setViewerOpen(true)
  }

  const closeViewer = useCallback(() => {
    setViewerOpen(false)
    setZoom(1)
  }, [])

  const zoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoom((z) => Math.min(z + 0.25, 4))
  }

  const zoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoom((z) => Math.max(z - 0.25, 0.5))
  }

  const resetZoom = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoom(1)
  }

  return (
    <>
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

        {/* Image with skeleton + viewer */}
        {task.proof_image_url && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              Image
            </span>
            <div className="relative rounded-[10px] overflow-hidden border border-border/40 max-h-[320px]">
              {/* Skeleton shown while image loads */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-muted/30 animate-pulse rounded-[10px] min-h-[200px]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <div className="w-10 h-10 rounded-full bg-muted-foreground/30" />
                      <div className="w-24 h-2 rounded bg-muted-foreground/30" />
                    </div>
                  </div>
                </div>
              )}
              {/* Actual image */}
              <img
                src={task.proof_image_url}
                alt="Submitted proof"
                onLoad={() => setImageLoaded(true)}
                onClick={openViewer}
                className={`w-full max-h-[320px] object-cover cursor-zoom-in hover:opacity-90 transition-opacity rounded-[10px] ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Click image to view fullscreen
            </p>
          </div>
        )}

      </div>

      {/* Image Viewer Dialog */}
      {viewerOpen && task.proof_image_url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeViewer}
        >
          {/* Controls */}
          <div
            className="absolute top-4 right-4 flex items-center gap-2 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={zoomOut}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-black/60 border border-white/10 text-white hover:bg-white/10 transition-colors"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetZoom}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-black/60 border border-white/10 text-white hover:bg-white/10 transition-colors"
              aria-label="Reset zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={zoomIn}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-black/60 border border-white/10 text-white hover:bg-white/10 transition-colors"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={closeViewer}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-black/60 border border-white/10 text-white hover:bg-red-500/80 transition-colors ml-2"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom level indicator */}
          <div className="absolute top-4 left-4 z-10">
            <span className="text-xs text-white/50 font-mono bg-black/40 px-2 py-1 rounded">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Image container — click inside doesn't close */}
          <div
            className="overflow-auto max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={task.proof_image_url}
              alt="Proof image fullscreen"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease',
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
          </div>

          {/* Click outside hint */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/30">
            Click outside to close
          </p>
        </div>
      )}
    </>
  )
}
