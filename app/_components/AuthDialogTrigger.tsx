"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth.store"

export default function AuthDialogTrigger() {
  const searchParams = useSearchParams()
  const { openDialog } = useAuthStore()

  useEffect(() => {
    const authRequired = searchParams.get("auth")
    const redirect = searchParams.get("redirect")

    if (authRequired === "required") {
      openDialog(redirect ?? undefined)
    }
  }, [searchParams])

  return null
}
