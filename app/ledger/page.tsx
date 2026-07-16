import { createClient } from "@/lib/supabase/server"
import { getActiveNetwork } from "@/lib/config/network.server"
import { LedgerPageContent } from "@/components/sections/LedgerPageContent"
import {
  computeLedgerStats,
  computeLedgerTransactions,
} from "@/lib/utils/ledger"

export const metadata = {
  title: "The Ledger - The Quest",
  description:
    "A public record of every completed mission on The Quest, verified on the Cardano blockchain.",
}

export const dynamic = "force-dynamic"

export default async function LedgerPage() {
  const supabase = await createClient()
  const network = await getActiveNetwork()

  // Same queries the landing section runs. Previously this page carried its own
  // copy, which is how its stat cards came to report 8 ADA above a table of
  // transactions summing to 56.33.
  const [initialTransactions, initialStats, countRes] = await Promise.all([
    computeLedgerTransactions(supabase, 20, 0),
    computeLedgerStats(supabase, network),
    supabase
      .from("task_logs")
      .select("*", { count: "exact", head: true })
      .eq("action", "completed"),
  ])

  const totalCount = countRes.count ?? 0

  return (
    <LedgerPageContent
      initialTransactions={initialTransactions}
      initialStats={initialStats}
      totalCount={totalCount}
      // Resolved here rather than via useAda in the client: the cookie is
      // authoritative and known now, so nothing flashes the wrong currency or
      // links at the wrong explorer before hydration.
      network={network}
    />
  )
}
