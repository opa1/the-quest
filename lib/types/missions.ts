export type MissionCategory =
  | 'ALL'
  | 'DESIGN'
  | 'CODE'
  | 'WRITING'
  | 'RESEARCH'
  | 'MARKETING'
  | 'COMBAT'
  | 'ART'
  | 'VIDEO'
  | 'AUDIO'
  | 'ANIMATION'
  | 'PHOTOGRAPHY'
  | 'TRANSLATION'
  | 'COMMUNITY'
  | 'MODERATION'
  | 'SOCIAL'
  | 'CONTENT'
  | 'DATA'
  | 'TESTING'
  | 'SECURITY'
  | 'CONTRACTS'
  | 'DEVOPS'
  | 'PRODUCT'
  | 'STRATEGY'
  | 'FINANCE'
  | 'LEGAL'
  | 'EDUCATION'
export type MissionDifficulty = 'ALL' | 'easy' | 'medium' | 'hard'
export type MissionSort = 'newest' | 'oldest' | 'reward'
export type MissionView = 'ALL' | 'MINE'
// ALL: open + completed (date order) · OPEN: hide completed · OPEN_FIRST: completed pushed to the bottom
export type MissionStatusFilter = 'ALL' | 'OPEN' | 'OPEN_FIRST'

export interface MissionFilters {
  viewMode: MissionView
  category: MissionCategory
  difficulty: MissionDifficulty
  sort: MissionSort
  status: MissionStatusFilter
}

export interface ContributionRecord {
  id: string
  task_id: string
  task_title: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  reward_credits: number
  ada_reward: number
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

export interface PostMissionForm {
  title: string
  description: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  ada_reward: number
  proof_type: 'url' | 'text' | 'image' | 'any'
  max_claimers: number
}

export type PostMissionError = {
  field: keyof PostMissionForm | 'submit'
  message: string
} | null

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
  ada_reward?: number
  max_claimers?: number
  reward_per_claimer?: number
  approved_claimers?: number
  deadline?: string | null
  proof_type?: 'url' | 'text' | 'image' | 'any'
  proof_notes?: string | null
  proof_image_url?: string | null
  status: string
  // Derived at fetch time, not stored: reading the clock during render violates
  // React's purity rule, so the stores stamp this on each row instead.
  deadline_passed?: boolean
  created_by: string
  created_at: string
  profiles: {
    username: string | null
    avatar_url: string | null
  } | null
}

export type ProofUrl = {
  id: string
  url: string
  created_at: string
}
