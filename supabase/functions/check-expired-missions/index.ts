import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const appUrl = Deno.env.get('APP_URL')!
const cronSecret = Deno.env.get('CRON_SECRET')!
// Set per deployment: 'Mainnet' on the mainnet project, 'Preprod' on testnet.
const network = Deno.env.get('NETWORK') ?? 'Preprod'

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: expiredTasks } = await supabase
    .from('tasks')
    .select('id')
    .lt('deadline', new Date().toISOString())
    .not('deadline', 'is', null)
    .or('status.not.in.(completed,cancelled),refund_status.in.(pending,failed)')

  if (!expiredTasks || expiredTasks.length === 0) {
    return new Response(JSON.stringify({ processed: 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let processed = 0
  const errors: string[] = []

  for (const task of expiredTasks) {
    try {
      const res = await fetch(`${appUrl}/api/deadline-refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cron-secret': cronSecret,
        },
        body: JSON.stringify({ taskId: task.id, network }),
      })
      if (res.ok) processed++
      else errors.push(`${task.id}: ${res.status}`)
    } catch (err) {
      errors.push(`${task.id}: ${err}`)
      console.error(`Failed to process task ${task.id}:`, err)
    }
  }

  return new Response(
    JSON.stringify({ processed, total: expiredTasks.length, errors }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})
