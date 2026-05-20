"use client"

import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface AuthState {
  user: User | null
  isLoading: boolean
  isDialogOpen: boolean
  redirectAfterAuth: string | null
  lastFetched: number | null

  openDialog: (redirectTo?: string) => void
  closeDialog: () => void
  setUser: (user: User | null) => void
  fetchUser: () => Promise<void>
  signInWithX: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isDialogOpen: false,
  redirectAfterAuth: null,
  lastFetched: null,

  openDialog: (redirectTo?: string) =>
    set({ isDialogOpen: true, redirectAfterAuth: redirectTo ?? null }),

  closeDialog: () => set({ isDialogOpen: false, redirectAfterAuth: null }),

  setUser: (user) => set({ user }),

  fetchUser: async () => {
    const { lastFetched } = get()
    const now = Date.now()

    if (lastFetched && now - lastFetched < 60_000) return

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    set({ user, isLoading: false, lastFetched: now })
  },

  signInWithX: async () => {
    const { redirectAfterAuth } = get()
    const supabase = createClient()

    const redirectTo = `${window.location.origin}/auth/callback${
      redirectAfterAuth
        ? `?redirect=${encodeURIComponent(redirectAfterAuth)}`
        : ""
    }`

    await supabase.auth.signInWithOAuth({
      provider: "x",
      options: { redirectTo },
    })
  },

  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null, lastFetched: null })
  },
}))
