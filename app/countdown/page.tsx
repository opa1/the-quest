import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CountdownView } from "@/components/molecules/CountdownView"

export const metadata = {
  title: "Mainnet Launching Soon — The Quest",
}

// Server-rendered so no app code leaks: if there's no active countdown, we
// redirect straight to home instead of ever showing the countdown shell.
export default async function CountdownPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "mainnet_countdown_ends_at")
    .maybeSingle()

  const endsAt = data?.value ? new Date(data.value).getTime() : null
  if (!endsAt || !Number.isFinite(endsAt) || Date.now() >= endsAt) {
    redirect("/")
  }

  return <CountdownView endsAt={endsAt} />
}
