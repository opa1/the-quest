"use client"

import { usePathname, useRouter } from "next/navigation"
import { QUEST_CONFIG } from "@/lib/config/quest.config"
import MobileNavIcon from "@/components/atoms/MobileNavIcon"
import MobileNavPostButton from "@/components/atoms/MobileNavPostButton"

export default function FloatingMobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const isPostPage = pathname === "/post"

  return (
    <div className="xl:hidden fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center">
      {/* Dark pill — icons only, no labels, no split */}
      <div className="flex h-14 items-center rounded-full border border-border/80 bg-card px-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {QUEST_CONFIG.mobileNav.map((item) => (
          <MobileNavIcon
            key={item.href}
            href={item.href}
            iconName={item.icon}
            label={item.label}
            isActive={pathname === item.href}
          />
        ))}
      </div>

      {/* Post button — larger, overlaps right edge of pill */}
      <div className="z-10">
        <MobileNavPostButton
          href={QUEST_CONFIG.mobileNavPost.href}
          isCancel={isPostPage}
          onClick={isPostPage ? () => router.back() : undefined}
        />
      </div>
    </div>
  )
}
