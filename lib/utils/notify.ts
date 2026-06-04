import { createAdminClient } from '@/lib/supabase/admin'

export type CreateNotificationInput = {
  userId: string
  actorId?: string
  type: string
  category: string
  title: string
  message: string
  actionUrl?: string
}

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  try {
    const adminClient = createAdminClient()
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
