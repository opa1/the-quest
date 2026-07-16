import { describe, it, expect } from 'vitest'
import { isProtectedRoute, networkSwitchDestination } from '@/lib/config/routes'

describe('isProtectedRoute', () => {
  it('matches routes under app/(protected)', () => {
    expect(isProtectedRoute('/missions')).toBe(true)
    expect(isProtectedRoute('/post')).toBe(true)
    expect(isProtectedRoute('/profile')).toBe(true)
  })

  it('matches nested paths and ignores query/hash', () => {
    expect(isProtectedRoute('/settings/wallet')).toBe(true)
    expect(isProtectedRoute('/missions?sort=newest')).toBe(true)
    expect(isProtectedRoute('/missions/')).toBe(true)
    expect(isProtectedRoute('/realm#top')).toBe(true)
  })

  it('leaves public routes alone', () => {
    expect(isProtectedRoute('/')).toBe(false)
    expect(isProtectedRoute('/ledger')).toBe(false)
    expect(isProtectedRoute('/how-it-works')).toBe(false)
    expect(isProtectedRoute('/terms')).toBe(false)
    expect(isProtectedRoute('/tasks/abc')).toBe(false)
  })

  it('does not treat a prefix collision as protected', () => {
    // '/postcard' merely starts with '/post'.
    expect(isProtectedRoute('/postcard')).toBe(false)
  })

  it('treats external and relative hrefs as public', () => {
    expect(isProtectedRoute('https://discord.gg/x')).toBe(false)
    expect(isProtectedRoute('#guild')).toBe(false)
  })
})

describe('networkSwitchDestination', () => {
  it('keeps the user where they are on portable routes', () => {
    expect(networkSwitchDestination('/missions')).toBe('/missions')
    expect(networkSwitchDestination('/realm')).toBe('/realm')
    expect(networkSwitchDestination('/profile')).toBe('/profile')
    expect(networkSwitchDestination('/ledger')).toBe('/ledger')
    expect(networkSwitchDestination('/')).toBe('/')
  })

  it('redirects away from task routes, whose ids live in one database only', () => {
    expect(networkSwitchDestination('/tasks/abc-123')).toBe('/missions')
    expect(networkSwitchDestination('/tasks/abc-123/submit')).toBe('/missions')
    expect(networkSwitchDestination('/tasks/abc-123/review')).toBe('/missions')
    expect(networkSwitchDestination('/tasks')).toBe('/missions')
  })

  it('does not mistake a similarly-named route for a task route', () => {
    expect(networkSwitchDestination('/tasksomething')).toBe('/tasksomething')
  })
})
