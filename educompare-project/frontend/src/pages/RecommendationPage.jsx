import { useEffect, useMemo, useState } from 'react'
import { getCountryRules, getPrograms, getRecommendations } from '../api/api'
import FormSection from '../components/FormSection'
import PageHeader from '../components/PageHeader'
import ResultCard from '../components/ResultCard'

function RecommendationPage() {
  const [programs, setPrograms] = useState([])
  const [countries, setCountries] = useState([])
  const [results, setResults] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    country_id: '',
    degree_level: '',
    instruction_language: '',
    max_budget: '',
    user_gpa: '',
    user_ielts: '',
  })

  useEffect(() => {
    async function loadOptions() {
      try {
        const [programData, countryData] = await Promise.all([
          getPrograms(),
          getCountryRules(),
        ])
        setPrograms(programData)
        setCountries(countryData)
      } catch {
        setError('Form options could not be loaded from the backend.')
      }
    }

    loadOptions()
  }, [])

  const degreeOptions = useMemo(
    () => [...new Set(programs.map((program) => program.degree_level))].sort(),
    [programs],
  )

  const languageOptions = useMemo(
    () => [...new Set(programs.map((program) => program.instruction_language))].sort(),
    [programs],
  )

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await getRecommendations({
        country_id: formData.country_id || undefined,
        degree_level: formData.degree_level || undefined,
        instruction_language: formData.instruction_language || undefined,
        max_budget: formData.max_budget || undefined,
        user_gpa: formData.user_gpa || undefined,
        user_ielts: formData.user_ielts || undefined,
      })

      if (Array.isArray(data)) {
        setResults(data)
      } else {
        setResults([])
        setError(data.detail ?? 'No recommendations returned.')
      }
    } catch {
      setResults([])
      setError('Recommendations could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Recommendation System"
        title="Filter strictly by country, degree, and language, then review scored results."
        description="The backend keeps strict filters and separate scoring logic. This form sends your inputs directly without recreating recommendation rules on the frontend."
      />

      <form onSubmit={handleSubmit}>
        <FormSection
          title="Student profile"
          description="Country, degree level, and instruction language are strict filters. Budget, GPA, and IELTS influence the score."
        >
          <label>
            Country
            <select name="country_id" value={formData.country_id} onChange={handleChange}>
              <option value="">All countries</option>
              {countries.map((country) => (
                <option key={country.country_id} value={country.country_id}>
                  {country.country_name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Degree level
            <select name="degree_level" value={formData.degree_level} onChange={handleChange}>
              <option value="">All degree levels</option>
              {degreeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Instruction language
            <select name="instruction_language" value={formData.instruction_language} onChange={handleChange}>
              <option value="">All languages</option>
              {languageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Maximum yearly budget
            <input
              type="number"
              name="max_budget"
              value={formData.max_budget}
              onChange={handleChange}
              placeholder="Example: 300000"
            />
          </label>

          <label>
            GPA
            <input
              type="number"
              step="0.01"
              name="user_gpa"
              value={formData.user_gpa}
              onChange={handleChange}
              placeholder="Example: 3.2"
            />
          </label>

          <label>
            IELTS
            <input
              type="number"
              step="0.5"
              name="user_ielts"
              value={formData.user_ielts}
              onChange={handleChange}
              placeholder="Example: 6.0"
            />
          </label>
        </FormSection>

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Loading recommendations...' : 'Get recommendations'}
        </button>
      </form>

      {error ? <p className="error-text">{error}</p> : null}

      <section className="results-block">
        <div className="section-heading">
          <h2>Recommendation results</h2>
          <p>Results are sorted by backend score. Review cost and requirements before deciding.</p>
        </div>

        {results.length ? (
          <div className="card-grid">
            {results.map((item) => (
              <ResultCard key={item.program_id} item={item} />
            ))}
          </div>
        ) : (
          <p className="empty-state">No recommendation results yet.</p>
        )}
      </section>
    </div>
  )
}

export default RecommendationPage
