import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import RealmHeader from '@/components/sections/RealmHeader'
import FloatingMobileNav from '@/components/molecules/FloatingMobileNav'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url, credits, onboarded')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarded) redirect('/onboarding')

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <RealmHeader
        username={profile.username ?? ''}
        avatarUrl={profile.avatar_url ?? null}
        credits={profile.credits ?? 0}
      />
      <ScrollArea className="flex-1 min-h-0 w-full">
        <main className="max-w-7xl mx-auto px-4 md:px-10 py-8 pt-22 pb-24 md:pb-8">
          {children}
        </main>
      </ScrollArea>
      <FloatingMobileNav />
    </div>
  )
}
