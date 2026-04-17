import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
})

export async function getPrograms(params) {
  const response = await api.get('/programs', { params })
  return response.data
}

export async function getProgramDetail(programId) {
  const response = await api.get(`/programs/${programId}`)
  return response.data
}

export async function getRequirements(params) {
  const response = await api.get('/requirements', { params })
  return response.data
}

export async function getCountryRules(params) {
  const response = await api.get('/country-rules', { params })
  return response.data
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

export async function getCostOverviewAnalytics() {
  const response = await api.get('/analytics/cost-overview')
  return response.data
}

export async function getAdmissionAnalytics() {
  const response = await api.get('/analytics/admission-overview')
  return response.data
}

export default api
