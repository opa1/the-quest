'use client'

import Link from 'next/link'
import { isProtectedRoute } from '@/lib/config/routes'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

interface GuardedLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onNavigate?: () => void
}

/**
 * Link that understands the auth boundary. Public and external hrefs render as
 * an ordinary Link; protected ones open the auth dialog for signed-out visitors
 * and resume to the destination afterwards, so a landing-page CTA never dumps
 * someone back on the landing page with no explanation.
 */
export function GuardedLink({
  href,
  children,
  className,
  onNavigate,
}: GuardedLinkProps) {
  const { guardedNavigate } = useAuthGuard()
  const external = href.startsWith('http')

  if (external || !isProtectedRoute(href)) {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className={className}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault()
        onNavigate?.()
        guardedNavigate(href)
      }}
    >
      {children}
    </Link>
  )
}
