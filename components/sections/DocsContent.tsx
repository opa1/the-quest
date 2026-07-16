import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'

interface DocsContentProps {
  title: string
  updated: string
  markdown: string
}

/**
 * Shared shell for the rendered Markdown docs (/terms, /privacy). Tailwind's
 * typography plugin isn't installed, so element styles are mapped explicitly.
 */
export function DocsContent({ title, updated, markdown }: DocsContentProps) {
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-16 sm:px-8 lg:px-10">
      <header className="flex flex-col gap-3 border-b border-border/50 pb-8">
        <h1 className="font-heading text-4xl font-black tracking-tight text-foreground uppercase md:text-5xl">
          {title}
        </h1>
        <p className="text-xs tracking-widest text-muted-foreground uppercase">
          Last updated {updated}
        </p>
      </header>

      <div className="flex flex-col gap-5 text-sm leading-relaxed text-muted-foreground">
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ children }) => (
              <h2 className="mt-6 font-heading text-xl font-bold tracking-tight text-foreground uppercase">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="mt-4 text-base font-bold text-foreground">{children}</h3>
            ),
            p: ({ children }) => <p className="leading-relaxed">{children}</p>,
            ul: ({ children }) => (
              <ul className="flex list-disc flex-col gap-2 pl-5">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="flex list-decimal flex-col gap-2 pl-5">{children}</ol>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-foreground">{children}</strong>
            ),
            a: ({ href, children }) => {
              const external = !!href?.startsWith('http')
              return (
                <Link
                  href={href ?? '/'}
                  {...(external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  {children}
                </Link>
              )
            },
          }}
        >
          {markdown}
        </Markdown>
      </div>
    </article>
  )
}
