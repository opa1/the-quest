import { NextRequest, NextResponse } from 'next/server'
import { processDeadlineRefund } from '@/app/actions/tasks'
import { normalizeNetwork } from '@/lib/config/network'

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('x-cron-secret')

  if (!cronSecret || authHeader !== cronSecret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { taskId, network } = await req.json()
  if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 })

  // The per-project cron sends its own network; act on that task's DB.
  const result = await processDeadlineRefund(taskId, normalizeNetwork(network))
  return NextResponse.json(result)
}
