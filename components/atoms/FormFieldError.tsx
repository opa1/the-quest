import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormFieldErrorProps {
  message: string | null | undefined
  className?: string
}

export default function FormFieldError({ message, className }: FormFieldErrorProps) {
  if (!message) return null

  return (
    <span className={cn('text-sm text-destructive flex items-center gap-1.5 mt-1', className)}>
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </span>
  )
}
