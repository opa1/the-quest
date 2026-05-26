import Image from "next/image"
import Link from "next/link"

export default function BannerPlaceholder() {
  return (
    <div className="relative aspect-2/1 min-h-40 w-full overflow-hidden rounded-[16px] border">
      <Image
        src="/images/bounty-banner.webp"
        alt="Bounty Board Banner"
        fill
        className="object-cover"
        priority
      />
    </div>
  )
}
