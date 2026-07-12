import type { Metadata } from "next"
import { Geist_Mono, DM_Sans } from "next/font/google"
import localFont from "next/font/local"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import AuthProvider from "@/components/providers/AuthProvider"
import { Suspense } from "react"
import AuthDialogTrigger from "./_components/AuthDialogTrigger"
import { MainnetWelcomeDialog } from "@/components/molecules/MainnetWelcomeDialog"
import { Countdown } from "@/components/molecules/Countdown"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title:
    "The Quest | Complete Tasks. Earn Credits. Build Your On-Chain Legacy.",
  description:
    "The Quest is a community task platform where you claim missions, do the work, and build a permanent reputation on the Cardano blockchain. Your record. Your legacy. Forever.",
  keywords: [
    "task platform",
    "micro tasks",
    "earn credits online",
    "Cardano blockchain",
    "on-chain reputation",
    "web3 tasks",
    "community tasks",
    "earn crypto",
    "task marketplace",
    "blockchain proof of work",
    "Cardano dApp",
    "reputation system",
  ],
  openGraph: {
    title:
      "The Quest | Complete Tasks. Earn Credits. Build Your On-Chain Legacy.",
    description:
      "Claim tasks across design, writing, code and more. Get paid in credits. Every mission you complete is recorded permanently on the Cardano blockchain. Start building your legacy today.",
    url: "https://thequesters.fun",
    siteName: "The Quest",
    images: [
      {
        url: "/og/the-quest-og.webp",
        width: 1200,
        height: 630,
        alt: "The Quest - Complete Tasks. Build Your On-Chain Legacy.",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "The Quest | Complete Tasks. Earn Credits. Build Your On-Chain Legacy.",
    description:
      "Claim tasks. Do the work. Get paid. Every completed mission is sealed on the Cardano blockchain forever. Your reputation starts now.",
    images: ["/og/the-quest-og.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://thequesters.fun",
  },
}

const youngerThanMeHeading = localFont({
  src: "../assets/fonts/YoungerThanMe/Younger-than-me.woff2",
  weight: "100 900",
  variable: "--font-heading",
})

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

// Launch countdown gate: while a future end date is set in `app_config`, the
// whole app is replaced by the full-screen Countdown — no app code renders and
// there's no redirect/route to 404. Lifts automatically at the end time (the
// page reloads into the real app).
async function getCountdownEndsAt() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "mainnet_countdown_ends_at")
    .maybeSingle()

  const endsAt = data?.value ? new Date(data.value).getTime() : null
  return endsAt && Number.isFinite(endsAt) && Date.now() < endsAt ? endsAt : null
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const countdownEndsAt = await getCountdownEndsAt()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        dmSans.variable,
        youngerThanMeHeading.variable
      )}
    >
      <body className="overflow-x-hidden">
        <ThemeProvider defaultTheme="dark">
          {countdownEndsAt ? (
            <Countdown endsAt={countdownEndsAt} />
          ) : (
            <AuthProvider>
              <Suspense>
                <AuthDialogTrigger />
              </Suspense>
              <MainnetWelcomeDialog />

              {children}
            </AuthProvider>
          )}
        </ThemeProvider>
      </body>
    </html>
  )
}
