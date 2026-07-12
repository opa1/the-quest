import { createAdminClient } from '@/lib/supabase/admin'
import { getActiveNetwork } from '@/lib/config/network.server'
import { type Network } from '@/lib/config/network'

export type CreateNotificationInput = {
  userId: string
  actorId?: string
  type: string
  category: string
  title: string
  message: string
  actionUrl?: string
  // Explicit network for non-request contexts (e.g. the deadline-refund cron).
  // Request-scoped callers omit it and get the active network.
  network?: Network
}

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  try {
    const adminClient = createAdminClient(input.network ?? (await getActiveNetwork()))
    await adminClient.from('notifications').insert({
      user_id: input.userId,
      actor_id: input.actorId ?? null,
      type: input.type,
      category: input.category,
      title: input.title,
      message: input.message,
      action_url: input.actionUrl ?? null,
      read: false,
    })
  } catch (err) {
    console.error('Failed to create notification:', err)
  }
}
