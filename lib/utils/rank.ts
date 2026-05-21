export function getRankFromCredits(credits: number): string {
  if (credits >= 100000) return 'LEGEND'
  if (credits >= 50000) return 'VETERAN'
  if (credits >= 10000) return 'ELITE'
  return 'INITIATE'
}

export function truncateAddress(address: string, start = 8, end = 6): string {
  if (address.length <= start + end) return address
  return `${address.slice(0, start)}...${address.slice(-end)}`
}
