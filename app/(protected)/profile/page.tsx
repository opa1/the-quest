import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileSettingsForm from '@/components/molecules/ProfileSettingsForm'
import WalletSettingsBlock from '@/components/molecules/WalletSettingsBlock'
import DangerZoneBlock from '@/components/molecules/DangerZoneBlock'
import LinkXBlock from '@/components/molecules/LinkXBlock'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export const metadata = {
  title: 'Profile - The Quest',
  description: 'Manage your Quest profile and wallet.',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url, x_handle, wallet_address, signup_method, x_linked')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/')

  const isWalletUser = profile.signup_method === 'wallet'

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">

      <h1 className="text-3xl md:text-4xl font-black uppercase text-foreground font-heading tracking-tight">
        {QUEST_CONFIG.settings.title}
      </h1>

      <ProfileSettingsForm
        username={profile.username ?? ''}
        avatarUrl={profile.avatar_url ?? null}
        xHandle={profile.x_handle ?? null}
      />

      <WalletSettingsBlock
        walletAddress={profile.wallet_address ?? null}
      />

      {isWalletUser && (
        <LinkXBlock
          xLinked={profile.x_linked ?? false}
          xHandle={profile.x_handle ?? null}
        />
      )}

      <DangerZoneBlock />

    </div>
  )
}
