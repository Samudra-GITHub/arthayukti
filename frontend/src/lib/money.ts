// Amounts arrive from the API as decimal strings. The frontend never does
// money arithmetic; it only formats them for display.

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const paise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const DECIMAL = /^-?\d+(\.\d+)?$/

export function formatMoney(amount: string, options: { paise?: boolean } = {}): string {
  if (!DECIMAL.test(amount)) {
    throw new Error(`Not a decimal amount: ${amount}`)
  }
  const formatter = options.paise ? paise : rupees
  // Intl formats decimal strings exactly, without converting through a float.
  return formatter.format(amount as `${number}`)
}
