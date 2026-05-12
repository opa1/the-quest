'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface CommLinkInputProps {
  placeholder?: string
  ctaLabel?: string
  onSubmit?: (value: string) => void
  className?: string
}

export function CommLinkInput({
  placeholder = 'ENTER COMM-LINK',
  ctaLabel = 'JOIN',
  onSubmit,
  className,
}: CommLinkInputProps) {
  const [value, setValue] = useState('')

  function handleSubmit() {
    onSubmit?.(value)
    setValue('')
  }

  return (
    <div
      className={cn(
        'flex h-12 items-center overflow-hidden rounded-[14px] border border-border bg-input',
        className
      )}
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder={placeholder}
        className="h-full flex-1 rounded-none border-0 bg-transparent px-4 focus-visible:border-transparent focus-visible:ring-0"
      />
      <Button
        variant="default"
        className="h-full rounded-l-none rounded-r-[10px]"
        onClick={handleSubmit}
      >
        {ctaLabel.toUpperCase()}
      </Button>
    </div>
  )
}
