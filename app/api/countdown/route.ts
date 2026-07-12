import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Authoritative countdown status the /countdown page polls when its local timer
// hits zero — so it only enters the site once the *server* agrees the countdown
// is over (avoids client clock-skew redirect loops). Exempt from the gate.
export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "mainnet_countdown_ends_at")
    .maybeSingle()

  const endsAt = data?.value ? new Date(data.value).getTime() : null
  const over = !endsAt || !Number.isFinite(endsAt) || Date.now() >= endsAt

  return NextResponse.json(
    { endsAt: over ? null : endsAt, over },
    { headers: { "cache-control": "no-store" } }
  )
}
