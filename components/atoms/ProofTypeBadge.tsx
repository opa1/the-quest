interface ProofTypeBadgeProps {
  proofType: 'url' | 'text' | 'image' | 'any'
}

const labelMap: Record<ProofTypeBadgeProps['proofType'], string> = {
  url:   'URL REQUIRED',
  text:  'TEXT REQUIRED',
  image: 'IMAGE REQUIRED',
  any:   'ANY PROOF',
}

export default function ProofTypeBadge({ proofType }: ProofTypeBadgeProps) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] border border-primary/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      {labelMap[proofType]}
    </span>
  )
}
