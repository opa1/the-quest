'use client'

import { useAuthStore } from '@/lib/stores/auth.store'
import { useRouter } from 'next/navigation'

export function useAuthGuard() {
  const { user, openDialog } = useAuthStore()
  const router = useRouter()

  const requireAuth = (redirectTo?: string) => {
    if (!user) {
      openDialog(redirectTo)
      return false
    }
    return true
  }

  const guardedNavigate = (href: string) => {
    if (!user) {
      openDialog(href)
      return
    }
    router.push(href)
  }

  return { requireAuth, guardedNavigate, isAuthenticated: !!user }
}
