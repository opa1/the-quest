import type { Metadata } from 'next'
import { DocsContent } from '@/components/sections/DocsContent'
import { readDoc } from '@/lib/utils/docs'

export const metadata: Metadata = {
  title: 'Privacy Policy | The Quest',
  description:
    'What data The Quest collects, why we collect it, and what stays permanently on-chain.',
}

export default async function PrivacyPage() {
  const markdown = await readDoc('privacy')
  return (
    <DocsContent title="Privacy Policy" updated="16 July 2026" markdown={markdown} />
  )
}
