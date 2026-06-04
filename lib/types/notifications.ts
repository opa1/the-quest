export type Notification = {
  id: string
  user_id: string
  actor_id: string | null
  type: string
  category: string
  title: string
  message: string
  action_url: string | null
  read: boolean
  created_at: string
}

export type NotificationCategory = 'mission' | 'reward' | 'system'
