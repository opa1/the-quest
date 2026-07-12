import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { ACTIVE_NETWORK_COOKIE, normalizeNetwork } from '@/lib/config/network'
import { supabasePublicConfig } from '@/lib/supabase/config'

// Flip on during a migration/deploy to send everyone to the maintenance page.
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true'

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
