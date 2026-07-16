import { readFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * Legal copy lives as plain Markdown in /content so it can be edited without
 * touching TSX. Server-only: reads from disk at request/build time.
 */
export async function readDoc(slug: string): Promise<string> {
  const file = path.join(process.cwd(), 'content', `${slug}.md`)
  return readFile(file, 'utf8')
}
