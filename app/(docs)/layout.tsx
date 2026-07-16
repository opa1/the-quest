import { Navbar } from '@/components/sections/Navbar'
import { SiteFooter } from '@/components/sections/SiteFooter'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20">{children}</main>
      <SiteFooter />
    </>
  )
}
