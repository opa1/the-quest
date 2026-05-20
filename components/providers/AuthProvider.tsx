'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth.store'
import AuthDialog from '@/components/molecules/AuthDialog'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, fetchUser } = useAuthStore()

  useEffect(() => {
    fetchUser()

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
      {children}
      <AuthDialog />
    </>
  )
}
