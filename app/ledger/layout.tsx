import { Navbar } from '@/components/sections/Navbar'

export default function LedgerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        {children}
      </main>
    </>
  )
}
