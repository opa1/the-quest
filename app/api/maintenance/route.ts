import { NextResponse } from "next/server"

// Lightweight status endpoint the maintenance page polls so it can auto-return
// users to where they were once maintenance ends. Exempt from the gate in proxy.ts.
export async function GET() {
  return NextResponse.json(
    { active: process.env.MAINTENANCE_MODE === "true" },
    { headers: { "cache-control": "no-store" } }
  )
}
