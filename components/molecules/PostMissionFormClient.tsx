"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// PostMissionForm pulls in the wallet connector, which reads window.localStorage
// while its module is evaluated — that throws when the server renders it. `/post`
// is a server component and can't pass ssr:false itself, so this thin client
// wrapper exists purely to load the form lazily, browser-side only.
const PostMissionForm = dynamic(
  () => import("@/components/molecules/PostMissionForm"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    ),
  }
)

export default function PostMissionFormClient({
  hasWallet,
}: {
  hasWallet: boolean
}) {
  return <PostMissionForm hasWallet={hasWallet} />
}
