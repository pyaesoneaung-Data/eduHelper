export function parseISODateOnly(dateStr) {
  if (!dateStr) return null

  const [year, month, day] = String(dateStr).split('-').map(Number)
  if (!year || !month || !day) return null

  return new Date(year, month - 1, day)
}

export function getTodayAtStartOfDay() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export function isDeadlinePassed(dateStr) {
  const deadline = parseISODateOnly(dateStr)
  if (!deadline) return false
  return deadline < getTodayAtStartOfDay()
}

export function formatDate(dateStr) {
  if (!dateStr) return null
  const date = parseISODateOnly(dateStr)
  if (!date) return dateStr
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
