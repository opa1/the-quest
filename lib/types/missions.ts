export type MissionCategory = 'ALL' | 'DESIGN' | 'CODE' | 'WRITING' | 'RESEARCH' | 'MARKETING' | 'COMBAT'
export type MissionDifficulty = 'ALL' | 'easy' | 'medium' | 'hard'
export type MissionSort = 'newest' | 'oldest' | 'reward'

export interface MissionFilters {
  category: MissionCategory
  difficulty: MissionDifficulty
  sort: MissionSort
}

export interface ContributionRecord {
  id: string
  task_id: string
  task_title: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  reward_credits: number
  completed_at: string
  cardano_tx_hash: string | null
}

export interface RecordStats {
  completed: number
  credits: number
  rank: string
  proofs: number
}

export interface UserProfile {
  id: string
  username: string | null
  avatar_url: string | null
  credits: number
  wallet_address: string | null
  x_handle: string | null
  created_at: string
  onboarded: boolean
}

export interface LeaderboardEntry {
  rank: number
  id: string
  username: string | null
  avatar_url: string | null
  credits: number
  completed: number
  proofs: number
  isCurrentUser?: boolean
}

export interface Mission {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  reward_credits: number
  status: string
  created_by: string
  created_at: string
  profiles: {
    username: string | null
    avatar_url: string | null
  } | null
}
