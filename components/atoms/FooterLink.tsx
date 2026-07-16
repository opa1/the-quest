import Link from 'next/link'
import { cn } from '@/lib/utils'

interface FooterLinkProps {
  label: string
  href: string
  external?: boolean
  className?: string
}

export function FooterLink({ label, href, external, className }: FooterLinkProps) {
  return (
    <Link
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(
        'text-[11px] uppercase tracking-widest text-muted-foreground font-semibold',
        'hover:text-foreground transition-colors duration-150 no-underline',
        className
      )}
    >
      {label}
    </Link>
  )
}
