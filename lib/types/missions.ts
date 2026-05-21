export type MissionCategory = 'ALL' | 'DESIGN' | 'CODE' | 'WRITING' | 'RESEARCH' | 'MARKETING' | 'COMBAT'
export type MissionDifficulty = 'ALL' | 'easy' | 'medium' | 'hard'
export type MissionSort = 'newest' | 'oldest' | 'reward'

export interface MissionFilters {
  category: MissionCategory
  difficulty: MissionDifficulty
  sort: MissionSort
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
