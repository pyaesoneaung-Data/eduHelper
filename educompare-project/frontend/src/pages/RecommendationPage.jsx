import { useEffect, useMemo, useState } from 'react'
import { getCountryRules, getPrograms, getRecommendations } from '../api/api'
import PageState from '../components/PageState'
import { useAppShell } from '../context/AppShellContext'
import { convertCurrency } from '../utils/currency'
import ResultCard from '../components/ResultCard'
import {
  ArrowCounterClockwise,
  BookOpen,
  CurrencyDollar,
  GlobeHemisphereWest,
  GraduationCap,
  MagnifyingGlass,
  Medal,
  Sparkle,
  Student,
  Translate,
} from '@phosphor-icons/react'

function formatBudgetPreview(rawValue, isUSD, countryId) {
  const amount = Number(rawValue)
  if (!rawValue || !amount || amount <= 0) return null

  if (!isUSD) {
    const currency = countryId === 'C001' ? 'TWD' : countryId === 'C002' ? 'THB' : countryId === 'C003' ? 'SGD' : null
    if (!currency) return null
    return `${Math.round(amount).toLocaleString()} ${currency}/yr`
  }

  if (countryId === 'C001') {
    const twd = Math.round(convertCurrency(amount, 'USD', 'TWD'))
    return `$${amount.toLocaleString()} USD ≈ ${twd.toLocaleString()} TWD/yr`
  }
  if (countryId === 'C002') {
    const thb = Math.round(convertCurrency(amount, 'USD', 'THB'))
    return `$${amount.toLocaleString()} USD ≈ ${thb.toLocaleString()} THB/yr`
  }
  if (countryId === 'C003') {
    const sgd = Math.round(convertCurrency(amount, 'USD', 'SGD'))
    return `$${amount.toLocaleString()} USD ≈ ${sgd.toLocaleString()} SGD/yr`
  }
  const twd = Math.round(convertCurrency(amount, 'USD', 'TWD'))
  const thb = Math.round(convertCurrency(amount, 'USD', 'THB'))
  const sgd = Math.round(convertCurrency(amount, 'USD', 'SGD'))
  return `$${amount.toLocaleString()} USD ≈ ${twd.toLocaleString()} TWD · ${thb.toLocaleString()} THB · ${sgd.toLocaleString()} SGD/yr`
}

const SESSION_KEY = 'unimatch_recommendation'

function RecommendationPage() {
  const { currency: displayCurrency, toggleCurrency, t } = useAppShell()
  const [programs, setPrograms] = useState([])
  const [countries, setCountries] = useState([])
  const [results, setResults] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [formData, setFormData] = useState({
    country_id: '',
    degree_level: '',
    instruction_language: '',
    max_budget: '',
    user_gpa: '',
    user_ielts: '',
  })

  // Restore state after back navigation
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY)
      if (saved) {
        const { formData: f, results: r, hasSearched: h } = JSON.parse(saved)
        if (f) setFormData(f)
        if (r) setResults(r)
        if (h) setHasSearched(h)
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY)
    }
  }, [])

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
    () => [...new Set(programs.map((p) => p.degree_level))].sort(),
    [programs],
  )

  const languageOptions = useMemo(
    () => [...new Set(programs.map((p) => p.instruction_language))].sort(),
    [programs],
  )

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setHasSearched(true)

    const isUSD = displayCurrency === 'USD'
    let nativeBudget = undefined
    if (formData.max_budget) {
      if (isUSD) {
        const targetCurrency = formData.country_id === 'C002' ? 'THB' : formData.country_id === 'C003' ? 'SGD' : 'TWD'
        nativeBudget = convertCurrency(Number(formData.max_budget), 'USD', targetCurrency)
      } else {
        nativeBudget = Number(formData.max_budget)
      }
    }

    try {
      const data = await getRecommendations({
        country_id: formData.country_id || undefined,
        degree_level: formData.degree_level || undefined,
        instruction_language: formData.instruction_language || undefined,
        max_budget: nativeBudget,
        user_gpa: formData.user_gpa || undefined,
        user_ielts: formData.user_ielts || undefined,
      })

      if (Array.isArray(data)) {
        setResults(data)
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ formData, results: data, hasSearched: true }))
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

  const isUSD = displayCurrency === 'USD'
  const budgetCurrencyLabel = isUSD ? 'USD'
    : formData.country_id === 'C001' ? 'TWD'
    : formData.country_id === 'C002' ? 'THB'
    : formData.country_id === 'C003' ? 'SGD'
    : null

  const budgetPreview = formatBudgetPreview(formData.max_budget, isUSD, formData.country_id)

  return (
    <div className="page-stack recommendation-page">
      <div className="section-heading recommendation-page-heading">
        <h2>{t('pages.programRecommendations', 'Program Recommendations')}</h2>
      </div>

      <form className="recommendation-form" onSubmit={handleSubmit} autoComplete="off">
        <section className="recommendation-profile-card">
          <div className="recommendation-card-header">
            <span className="recommendation-icon-tile" aria-hidden="true">
              <Student size={40} />
            </span>
            <div>
              <h3>Student Profile</h3>
              <p>All fields are optional. Fill in what you know, more inputs give better results.</p>
            </div>
          </div>

          <div className="recommendation-field-row recommendation-field-row-top">
            <label className="recommendation-field recommendation-field-top">
              <span className="recommendation-field-label">
                Country
              </span>
              <span className="recommendation-control">
                <GlobeHemisphereWest size={24} className="recommendation-control-icon" aria-hidden="true" />
                <select
                  name="country_id"
                  value={formData.country_id}
                  onChange={handleChange}
                >
                  <option value="">All countries</option>
                  {countries.map((country) => (
                    <option key={country.country_id} value={country.country_id}>
                      {country.country_name}
                    </option>
                  ))}
                </select>
              </span>
            </label>

            <label className="recommendation-field recommendation-field-top">
              <span className="recommendation-field-label">
                Degree level
              </span>
              <span className="recommendation-control">
                <GraduationCap size={24} className="recommendation-control-icon" aria-hidden="true" />
                <select
                  name="degree_level"
                  value={formData.degree_level}
                  onChange={handleChange}
                >
                  <option value="">All degree levels</option>
                  {degreeOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </span>
            </label>

            <label className="recommendation-field recommendation-field-top">
              <span className="recommendation-field-label">
                Language
              </span>
              <span className="recommendation-control">
                <Translate size={24} className="recommendation-control-icon" aria-hidden="true" />
                <select
                  name="instruction_language"
                  value={formData.instruction_language}
                  onChange={handleChange}
                >
                  <option value="">All languages</option>
                  {languageOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </span>
            </label>

          </div>

          <div className="recommendation-field-row">
            <label className="recommendation-field">
              <span className="recommendation-field-label">
                Maximum yearly budget{budgetCurrencyLabel ? <span className="label-unit"> ({budgetCurrencyLabel})</span> : null}
              </span>
              <span className="recommendation-control">
                <CurrencyDollar size={24} className="recommendation-control-icon" aria-hidden="true" />
                <input
                  type="number"
                  name="max_budget"
                  value={formData.max_budget}
                  onChange={handleChange}
                  placeholder={isUSD ? 'e.g. 5,000' : 'e.g. 200,000'}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
              </span>
              {formData.max_budget ? (
                <div className="budget-hints">
                  {budgetPreview ? <p className="budget-preview">{budgetPreview}</p> : null}
                  <p className="muted-text recommendation-helper-text">
                    Covers tuition + living costs combined.
                  </p>
                </div>
              ) : <span className="recommendation-helper-reserve" />}
            </label>

            <label className="recommendation-field">
              <span className="recommendation-field-label">
                GPA
              </span>
              <span className="recommendation-control">
                <Medal size={24} className="recommendation-control-icon" aria-hidden="true" />
                <input
                  type="number"
                  step="0.01"
                  name="user_gpa"
                  value={formData.user_gpa}
                  onChange={handleChange}
                  placeholder="e.g. 3.2"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
              </span>
              {formData.user_gpa ? (
                <p className="muted-text recommendation-helper-text">
                  4.0 scale: 80% is ~3.2, 70% is ~2.8, 60% is ~2.0
                </p>
              ) : <span className="recommendation-helper-reserve" />}
            </label>

            <label className="recommendation-field">
              <span className="recommendation-field-label">
                IELTS
              </span>
              <span className="recommendation-control">
                <BookOpen size={24} className="recommendation-control-icon" aria-hidden="true" />
                <input
                  type="number"
                  step="0.5"
                  name="user_ielts"
                  value={formData.user_ielts}
                  onChange={handleChange}
                  placeholder="e.g. 6.0"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
              </span>
              <span className="recommendation-helper-reserve" />
            </label>
          </div>

          <div className="recommendation-action-row">
            <button className="primary-button recommendation-submit-button" type="submit" disabled={loading}>
              <Sparkle size={20} aria-hidden="true" />
              {loading ? 'Loading...' : 'Get recommendations'}
            </button>
            <button
              type="button"
              className="secondary-button recommendation-clear-button"
              disabled={loading}
              onClick={() => {
                setFormData({ country_id: '', degree_level: '', instruction_language: '', max_budget: '', user_gpa: '', user_ielts: '' })
                setResults([])
                setHasSearched(false)
                setError('')
                sessionStorage.removeItem(SESSION_KEY)
              }}
            >
              <ArrowCounterClockwise size={20} aria-hidden="true" />
              Clear
            </button>
          </div>
        </section>
      </form>

      <PageState error={error} />

      <section className="results-block recommendation-results">
        {hasSearched && !loading && (
          <div className="recommendation-results-header">
            <span className="recommendation-results-icon" aria-hidden="true">
              <Sparkle size={24} />
            </span>
            <div>
              <h3>{t('pages.recommendationResults', 'Recommendation results')}</h3>
            </div>
          </div>
        )}

        {results.length > 0 ? (
          <>
            <p className="muted-text">
              Showing {results.length} program{results.length === 1 ? '' : 's'} matching your profile.{' '}
              {displayCurrency === 'USD' ? 'Costs converted to USD.' : 'Costs shown in local currencies.'}{' '}
              <button type="button" className="text-button" onClick={toggleCurrency}>
                {displayCurrency === 'USD' ? 'Switch to local →' : 'Switch to USD →'}
              </button>
            </p>
            <div className="card-grid">
              {results.map((item) => (
                <ResultCard key={item.program_id} item={item} />
              ))}
            </div>
          </>
        ) : hasSearched && !loading ? (
          <div className="recommendation-empty-state">
            <MagnifyingGlass size={128} aria-hidden="true" />
            <p>No programs matched your criteria. Try broadening your filters.</p>
          </div>
        ) : (
          <div className="hub-pre-result" aria-live="polite">
            <MagnifyingGlass size={56} aria-hidden="true" />
            <p>{loading ? 'Finding matching programs...' : 'Fill in your profile above to see matching programs.'}</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default RecommendationPage
