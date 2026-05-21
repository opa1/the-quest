import ContributionCard from '@/components/atoms/ContributionCard'
import RecordEmptyState from '@/components/atoms/RecordEmptyState'
import type { ContributionRecord } from '@/lib/types/missions'

interface ContributionListProps {
  records: ContributionRecord[]
}

export default function ContributionList({ records }: ContributionListProps) {
  if (records.length === 0) {
    return <RecordEmptyState />
  }

  return (
    <div className="flex flex-col gap-4">
      {records.map((record) => (
        <ContributionCard key={record.id} record={record} />
      ))}
    </div>
  )
}
