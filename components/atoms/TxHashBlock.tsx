import { cn } from "@/lib/utils"

interface TxHashBlockProps {
  blockHash: string
  txId: string
  compact?: boolean
  className?: string
}

export function TxHashBlock({
  blockHash,
  txId,
  compact,
  className,
}: TxHashBlockProps) {
  return (
    <div
      className={cn(
        "space-y-4 rounded-[8px] border border-border/40 bg-background/60 px-4 py-3 font-mono text-[11px] break-all text-muted-foreground",
        className
      )}
    >
      {compact ? (
        <div>
          {blockHash} | {txId}
        </div>
      ) : (
        <>
          <div>
            <b>Block Hash:</b> <p className="inline">{blockHash}</p>
          </div>

          <div>
            <b>TxID:</b> <p className="inline">{txId}</p>
          </div>
        </>
      )}
    </div>
  )
}
