const network = process.env.NEXT_PUBLIC_CARDANO_NETWORK ?? 'Preprod'

export const ADA_LABEL = network === 'Mainnet' ? 'ADA' : 'tADA'

export function formatAda(lovelace: number): string {
  const ada = lovelace / 1_000_000
  return `${ada % 1 === 0 ? ada.toFixed(0) : ada.toFixed(2)} ${ADA_LABEL}`
}
