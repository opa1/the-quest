import { ClassAccentBar } from '@/components/atoms/ClassAccentBar'
import { RoleLabel } from '@/components/atoms/RoleLabel'
import { cn } from '@/lib/utils'

interface ClassCardProps {
  id: string
  roleLabel: string
  className: string
  description: string
  accentColor: string
  accentColorClass: string
  image: string
}

export function ClassCard({
  roleLabel,
  className,
  description,
  accentColor,
  accentColorClass,
  image,
}: ClassCardProps) {
  return (
    <div
      className={cn(
        'group relative h-[500px] w-full overflow-hidden rounded-[16px] border border-border/40 transition-colors duration-300 hover:border-primary/40 md:h-[560px]'
      )}
    >
      <img
        src={image}
        alt={className}
        className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

      <div className="absolute left-0 right-0 top-0 z-20">
        <ClassAccentBar colorClass={accentColorClass} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col gap-2 p-6">
        <RoleLabel label={roleLabel} color={accentColor} />
        <h3 className="text-2xl font-black uppercase leading-none tracking-wide text-foreground">
          {className}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  )
}
