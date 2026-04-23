// Exchange rates as of 19 April 2026 — source: XE.com
export const EXCHANGE_RATE_DATE = '19 April 2026'

// TWD ↔ THB direct rates (used for native mode exchange rate card)
export const TWD_TO_THB = 1.0164
export const THB_TO_TWD = 0.9839

// How many USD equals 1 unit of each currency
const TO_USD = {
  USD: 1,
  TWD: 0.03174725,
  THB: 0.03134062,
  SGD: 0.78560070,
}

// How many units of each currency equals 1 USD
export const FROM_USD = {
  TWD: 31.49878342,
  THB: 31.90746633,
  SGD: 1.27282557,
}

/**
 * Convert an amount from one currency to another using USD as the pivot.
 * Returns null if amount is null/undefined.
 */
export function convertCurrency(amount, fromCurrency, toCurrency) {
  if (amount === null || amount === undefined) return null
  if (fromCurrency === toCurrency) return Number(amount)
  const inUSD = Number(amount) * TO_USD[fromCurrency]
  return inUSD / TO_USD[toCurrency]
}

/**
 * Format a cost value for display.
 * displayCurrency: 'native' shows nativeCurrency as-is, 'USD' converts.
 */
export function formatDisplayCost(amount, nativeCurrency, displayCurrency) {
  if (amount === null || amount === undefined) return 'Not available'
  const isNative = displayCurrency === 'native'
  const targetCurrency = isNative ? nativeCurrency : displayCurrency
  const value = isNative ? Number(amount) : convertCurrency(amount, nativeCurrency, displayCurrency)
  return `${Math.round(value).toLocaleString()} ${targetCurrency}`
}
