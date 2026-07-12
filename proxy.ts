import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { ACTIVE_NETWORK_COOKIE, normalizeNetwork } from '@/lib/config/network'
import { supabasePublicConfig } from '@/lib/supabase/config'

// Flip on during a migration/deploy to send everyone to the maintenance page.
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true'

// Cache the countdown end so we only hit the DB ~once per instance per TTL. We
// cache the end *timestamp* (not a boolean), so the gate still lifts exactly at
// the end even if the cache is warm; the TTL only bounds how fast a DB edit
// propagates.
const COUNTDOWN_TTL = 30_000
let countdownCache: { endsAt: number | null; fetchedAt: number } | null = null

type MiddlewareSupabase = ReturnType<typeof createServerClient>

async function getCountdownEndsAt(
  supabase: MiddlewareSupabase
): Promise<number | null> {
  const now = Date.now()
  if (countdownCache && now - countdownCache.fetchedAt < COUNTDOWN_TTL) {
    return countdownCache.endsAt
  }
  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'mainnet_countdown_ends_at')
      .maybeSingle()
    if (error) throw error
    const parsed = data?.value ? new Date(data.value).getTime() : NaN
    countdownCache = {
      endsAt: Number.isFinite(parsed) ? parsed : null,
      fetchedAt: now,
    }
  } catch {
    // Keep the last known value on a transient error; fail open if we never had one.
    if (!countdownCache) countdownCache = { endsAt: null, fetchedAt: now }
  }
  return countdownCache.endsAt
}

export async function proxy(request: NextRequest) {
  // Hard gate: while in maintenance, only the maintenance page (and its status
  // endpoint) are reachable. Remember where the user was so we can send them
  // back once maintenance ends.
  const path = request.nextUrl.pathname
  if (
    MAINTENANCE_MODE &&
    path !== '/maintenance' &&
    path !== '/api/maintenance'
  ) {
    const url = new URL('/maintenance', request.url)
    url.searchParams.set('from', path + request.nextUrl.search)
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({ request })

  const network = normalizeNetwork(
    request.cookies.get(ACTIVE_NETWORK_COOKIE)?.value
  )
  const { url, anonKey } = supabasePublicConfig(network)

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Launch countdown gate: while a future end date is set, every page and route
  // (except the countdown page + its status endpoint) is blocked, so no app
  // code is served until the countdown completes.
  if (path !== '/countdown' && path !== '/api/countdown') {
    const endsAt = await getCountdownEndsAt(supabase)
    if (endsAt && Date.now() < endsAt) {
      return NextResponse.redirect(new URL('/countdown', request.url))
    }
  }

  const { data: { user } } = await supabase.auth.getUser()

  const isBypassRoute = ['/onboarding', '/auth'].some(
    (route) => request.nextUrl.pathname.startsWith(route)
  )
  if (isBypassRoute) return supabaseResponse

  const isProtectedRoute = [
    '/realm', '/missions', '/post', '/record', '/leaderboard', '/profile', '/settings',
  ].some((route) => request.nextUrl.pathname.startsWith(route))

  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/', request.url)
    redirectUrl.searchParams.set('auth', 'required')
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (user && isProtectedRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarded')
      .eq('id', user.id)
      .single()

    if (!profile?.onboarded) {
      const onboardingUrl = new URL('/onboarding', request.url)
      onboardingUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(onboardingUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
