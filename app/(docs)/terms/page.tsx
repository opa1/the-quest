import type { Metadata } from 'next'
import { DocsContent } from '@/components/sections/DocsContent'
import { readDoc } from '@/lib/utils/docs'

export const metadata: Metadata = {
  title: 'Terms of Service | The Quest',
  description:
    'The terms governing your use of The Quest — posting missions, claiming bounties, and ADA rewards.',
}

export default async function TermsPage() {
  const markdown = await readDoc('terms')
  return (
    <DocsContent title="Terms of Service" updated="16 July 2026" markdown={markdown} />
  )
}
