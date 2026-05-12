import { cn } from '@/lib/utils'

interface SectionWrapperProps {
  children: React.ReactNode
  id?: string
  as?: 'section' | 'footer' | 'div'
  className?: string
  innerClassName?: string
  /** Skip the inner max-width container (e.g. full-bleed sections like TheGates) */
  noContainer?: boolean
  style?: React.CSSProperties
}

export function SectionWrapper({
  children,
  id,
  as: Tag = 'section',
  className,
  innerClassName,
  noContainer = false,
  style,
}: SectionWrapperProps) {
  return (
    <Tag id={id} className={className} style={style}>
      {noContainer ? (
        children
      ) : (
        <div
          className={cn(
            'mx-auto max-w-7xl',
            'px-5 sm:px-8 lg:px-10',
            'py-16 sm:py-20 lg:py-32',
            innerClassName
          )}
        >
          {children}
        </div>
      )}
    </Tag>
  )
}
