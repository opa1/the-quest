import { Suspense } from "react"
import AuthDialogTrigger from "./_components/AuthDialogTrigger"
import { ScrollToTop } from "@/components/atoms/ScrollToTop"
import { Arsenal } from "@/components/sections/Arsenal"
import { BountyBoard } from "@/components/sections/BountyBoard"
import { Guild } from "@/components/sections/Guild"
import { Navbar } from "@/components/sections/Navbar"
import { SiteFooter } from "@/components/sections/SiteFooter"
import { TheGates } from "@/components/sections/TheGates"
import { TheLedger } from "@/components/sections/TheLedger"
import { WarRoom } from "@/components/sections/WarRoom"

export default function Page() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
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
