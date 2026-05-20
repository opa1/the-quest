export type FeedEventType = 'new_bounty' | 'claimed' | 'completed'

export interface FeedEvent {
  id: string
  type: FeedEventType
  created_at: string
  task_id: string
  task_title: string
  category: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  reward_credits: number
  actor_username: string
  actor_avatar: string | null
  poster_username: string | null
  cardano_tx_hash: string | null
}

export type FeedFilter = 'ALL' | 'BOUNTIES' | 'CLAIMED' | 'COMPLETED'
