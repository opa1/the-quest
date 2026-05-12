import Link from 'next/link'
import { cn } from '@/lib/utils'

interface FooterLinkProps {
  label: string
  href: string
  className?: string
}

export function FooterLink({ label, href, className }: FooterLinkProps) {
  return (
    <Link
      href={href}
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
