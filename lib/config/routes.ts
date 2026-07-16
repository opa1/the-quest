/**
 * Routes living under app/(protected). Their layout redirects signed-out users
 * back to '/', so a public link straight to one of these silently bounces the
 * visitor. GuardedLink checks this list and opens the auth dialog instead,
 * carrying the destination through the sign-in.
 */
const PROTECTED_ROUTES = [
  '/realm',
  '/missions',
  '/post',
  '/record',
  '/leaderboard',
  '/profile',
  '/settings',
] as const

export function isProtectedRoute(href: string): boolean {
  if (!href.startsWith('/')) return false
  const path = href.split(/[?#]/)[0].replace(/\/$/, '')
  return PROTECTED_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`)
  )
}

/**
 * Routes keyed to a specific database row. The two networks are physically
 * separate Supabase projects, so a task id from one simply does not exist in
 * the other — staying put across a switch would land on notFound(). Every other
 * route (boards, listings, static pages) renders fine against either database.
 */
const NETWORK_SCOPED_ROUTES = ['/tasks'] as const

/**
 * Where to land after switching network, given the page the user is on.
 * Keeps them in place where that's meaningful, and falls back to the closest
 * equivalent page where the current URL can't survive the switch.
 *
 * Signing in is not this function's problem: if there's no session on the
 * target network, the protected layout redirects to '/' on arrival — the same
 * place the switcher used to send everyone unconditionally.
 */
export function networkSwitchDestination(pathname: string): string {
  const path = pathname.replace(/\/$/, '') || '/'
  const scoped = NETWORK_SCOPED_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`)
  )
  return scoped ? '/missions' : pathname
}
