'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface TimeAgoProps {
  date: string
  className?: string
}

function timeAgo(date: string): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function TimeAgo({ date, className }: TimeAgoProps) {
  const [label, setLabel] = useState(() => timeAgo(date))

  useEffect(() => {
    const id = setInterval(() => setLabel(timeAgo(date)), 60_000)
    return () => clearInterval(id)
  }, [date])

  return <span className={cn('text-xs text-muted-foreground', className)}>{label}</span>
}
