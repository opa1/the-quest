import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TextLinkProps {
  label: string
  href?: string
  className?: string
}

export function TextLink({ label, href = '#', className }: TextLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-primary transition-colors duration-150 hover:text-primary/80',
        className
      )}
    >
      {label}
      <ArrowRight className="h-3 w-3" />
    </Link>
  )
}
