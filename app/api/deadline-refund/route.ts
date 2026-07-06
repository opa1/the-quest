import { NextRequest, NextResponse } from 'next/server'
import { processDeadlineRefund } from '@/app/actions/tasks'

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('x-cron-secret')

  if (!cronSecret || authHeader !== cronSecret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { taskId } = await req.json()
  if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 })

  const result = await processDeadlineRefund(taskId)
  return NextResponse.json(result)
}
