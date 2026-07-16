import { createClient } from '@/lib/supabase/server'

export type CommunityStats = {
  /** Formatted for display, e.g. "22" or "1.2K". */
  operativeCount: string
  /** Avatar URLs of the most recent operatives who have one. May be empty. */
  avatars: string[]
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return String(n)
}

/**
 * Real headcount for the hero. This used to be a hardcoded "10K+", which was
 * simply untrue. Falls back to an empty stack rather than inventing a number:
 * the hero degrades to no stat instead of lying.
 */
export async function fetchCommunityStats(): Promise<CommunityStats> {
  try {
    const supabase = await createClient()

    const [countRes, avatarRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('avatar_url')
        .not('avatar_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(3),
    ])

    return {
      operativeCount: formatCount(countRes.count ?? 0),
      avatars: (avatarRes.data ?? [])
        .map((p) => p.avatar_url as string)
        .filter(Boolean),
    }
  } catch {
    return { operativeCount: '0', avatars: [] }
  }
}
