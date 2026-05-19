import { ScrollToTop } from '@/components/atoms/ScrollToTop'
import { Arsenal } from '@/components/sections/Arsenal'
import { BountyBoard } from '@/components/sections/BountyBoard'
import { Guild } from '@/components/sections/Guild'
import { Navbar } from '@/components/sections/Navbar'
import { SiteFooter } from '@/components/sections/SiteFooter'
import { TheGates } from '@/components/sections/TheGates'
import { TheLedger } from '@/components/sections/TheLedger'
import { WarRoom } from '@/components/sections/WarRoom'

export default function Page() {
  return (
    <main className="bg-background min-h-screen overflow-x-hidden">
      <Navbar />
      <WarRoom />
      <BountyBoard />
      <Arsenal />
      <Guild />
      <TheLedger />
      <TheGates />
      <SiteFooter />
      <ScrollToTop />
    </main>
  )
}
