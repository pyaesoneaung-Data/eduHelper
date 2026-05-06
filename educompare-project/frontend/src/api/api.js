import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: apiBaseUrl,
})

// Session-scoped cache for reference data that doesn't change during a session.
// Stores the promise itself so simultaneous callers share one in-flight request.
// Failed requests are evicted so they can be retried.
const sessionCache = new Map()

function withCache(key, fetcher) {
  if (!sessionCache.has(key)) {
    const promise = fetcher().catch((err) => {
      sessionCache.delete(key)
      throw err
    })
    sessionCache.set(key, promise)
  }
  return sessionCache.get(key)
}

// Parameterised calls bypass the cache; bare calls (no params) are cached.
export function getPrograms(params) {
  if (params) return api.get('/programs', { params }).then((r) => r.data)
  return withCache('programs', () => api.get('/programs').then((r) => r.data))
}

export function getUniversities(params) {
  if (params) return api.get('/universities', { params }).then((r) => r.data)
  return withCache('universities', () => api.get('/universities').then((r) => r.data))
}

export async function getProgramDetail(programId) {
  const response = await api.get(`/programs/${programId}`)
  return response.data
}

export async function getRequirements(params) {
  const response = await api.get('/requirements', { params })
  return response.data
}

export function getCountryRules(params) {
  if (params) return api.get('/country-rules', { params }).then((r) => r.data)
  return withCache('country-rules', () => api.get('/country-rules').then((r) => r.data))
}

export async function getCosts(params) {
  const response = await api.get('/costs', { params })
  return response.data
}

export async function getComparePrograms(programIds) {
  const response = await api.get('/compare/programs', {
    params: { program_ids: programIds.join(',') },
  })
  return response.data
}

export async function getCostSummary(programId) {
  const response = await api.get('/cost-summary', {
    params: { program_id: programId },
  })
  return response.data
}

export async function getRecommendations(params) {
  const response = await api.get('/recommend/programs', { params })
  return response.data
}

export function getBestValuePrograms() {
  return withCache('best-value-programs', () =>
    api.get('/analytics/best-value-programs').then((r) => r.data),
  )
}

export function getCostOverviewAnalytics() {
  return withCache('cost-overview', () =>
    api.get('/analytics/cost-overview').then((r) => r.data),
  )
}

export function getAdmissionAnalytics() {
  return withCache('admission-overview', () =>
    api.get('/analytics/admission-overview').then((r) => r.data),
  )
}

export async function getRankingOverview() {
  const response = await api.get('/analytics/ranking-overview')
  return response.data
}

export default api
