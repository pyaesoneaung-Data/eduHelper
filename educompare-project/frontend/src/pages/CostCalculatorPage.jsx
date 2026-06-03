import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCostSummary, getPrograms, getUniversities } from '../api/api'
import PageState from '../components/PageState'
import { useAppShell } from '../context/AppShellContext'
import { convertCurrency } from '../utils/currency'
import FormSection from '../components/FormSection'
import InfoCard from '../components/InfoCard'

const COUNTRY_NAMES = { C001: 'Taiwan', C002: 'Thailand', C003: 'Singapore' }
const COUNTRY_ORDER = ['C001', 'C002', 'C003']
const SESSION_KEY = 'unimatch_calculator'

function formatCost(value, nativeCurrency, displayCurrency) {
  if (value === null || value === undefined) return 'Not listed'
  const isUSD = displayCurrency === 'USD'
  const amount = isUSD ? convertCurrency(Number(value), nativeCurrency, 'USD') : Number(value)
  const label = isUSD ? 'USD' : (nativeCurrency ?? '')
  return `${Math.round(amount).toLocaleString()} ${label}`.trim()
}

function CostCalculatorPage() {
  const { currency: displayCurrency, toggleCurrency, t } = useAppShell()
  const [programs, setPrograms] = useState([])
  const [universities, setUniversities] = useState([])
  const [programId, setProgramId] = useState('')
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Restore state after back navigation
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY)
      if (saved) {
        const { programId: savedId, summary: savedSummary } = JSON.parse(saved)
        if (savedId) setProgramId(savedId)
        if (savedSummary) setSummary(savedSummary)
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY)
    }
  }, [])

  useEffect(() => {
    async function loadPrograms() {
      try {
        const [programData, universityData] = await Promise.all([getPrograms(), getUniversities()])
        setPrograms(programData)
        setUniversities(universityData)
      } catch {
        setError('Unable to load programs for the calculator.')
      }
    }

    loadPrograms()
  }, [])

  const universityMap = useMemo(
    () => universities.reduce((map, university) => {
      map[university.university_id] = university
      return map
    }, {}),
    [universities],
  )

  const programsByCountry = useMemo(() => {
    const groups = Object.fromEntries(COUNTRY_ORDER.map((id) => [id, []]))
    programs.forEach((program) => {
      const countryId = universityMap[program.university_id]?.country_id
      if (countryId && groups[countryId]) groups[countryId].push(program)
    })
    return groups
  }, [programs, universityMap])

  async function handleSubmit(event) {
    event.preventDefault()

    if (!programId) {
      setError('Select a program before calculating costs.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await getCostSummary(programId)
      setSummary(data)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ programId, summary: data }))
    } catch {
      setSummary(null)
      setError('Cost summary could not be loaded for that program.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-stack cost-calculator-page">
      <div className="section-heading cost-calculator-page-heading">
        <h2>{t('nav.costCalculator', 'Cost Calculator')}</h2>
        <p>See the full yearly cost picture: tuition, living costs, and fees, not just the headline figure agents usually show.</p>
      </div>

      <form className="page-stack cost-calculator-form" onSubmit={handleSubmit}>
        <FormSection
          title="Program selection"
          description="Select a program to see the full yearly cost breakdown: tuition, living costs, application fee, and insurance."
        >
          <label>
            Program
            <select value={programId} onChange={(event) => setProgramId(event.target.value)}>
              <option value="">Select program</option>
              {COUNTRY_ORDER.map((countryId) =>
                programsByCountry[countryId]?.length ? (
                  <optgroup key={countryId} label={COUNTRY_NAMES[countryId]}>
                    {programsByCountry[countryId].map((program) => (
                      <option key={program.program_id} value={program.program_id}>
                        {`${universityMap[program.university_id]?.university_name ?? 'Unknown university'} · ${program.major_name}`}
                      </option>
                    ))}
                  </optgroup>
                ) : null,
              )}
            </select>
          </label>
        </FormSection>

        <div className="action-row cost-actions">
          <button className="primary-button cost-primary-button" type="submit" disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate yearly cost'}
          </button>
          <button
            type="button"
            className="secondary-button cost-secondary-button"
            onClick={() => {
              setProgramId('')
              setSummary(null)
              setError('')
              sessionStorage.removeItem(SESSION_KEY)
            }}
          >
            Clear
          </button>
        </div>
      </form>

      <PageState error={error} />

      {summary ? (
        <InfoCard title="Cost summary">
          <p className="muted-text" style={{ marginBottom: '12px' }}>
            {displayCurrency === 'USD' ? 'Costs converted to USD. ' : `Costs shown in ${summary.currency}. `}
            <button type="button" className="text-button" onClick={toggleCurrency}>
              {displayCurrency === 'USD' ? 'Switch to native →' : 'Switch to USD →'}
            </button>
          </p>
          <dl className="detail-grid">
            <div>
              <dt>Tuition per semester</dt>
              <dd>{formatCost(summary.tuition_per_semester, summary.currency, displayCurrency)}</dd>
            </div>
            <div>
              <dt>Yearly tuition</dt>
              <dd>{formatCost(summary.yearly_tuition, summary.currency, displayCurrency)}</dd>
            </div>
            <div>
              <dt>Monthly living cost</dt>
              <dd>{formatCost(summary.monthly_living_cost, summary.currency, displayCurrency)}</dd>
            </div>
            <div>
              <dt>Yearly living cost</dt>
              <dd>{formatCost(summary.yearly_living_cost, summary.currency, displayCurrency)}</dd>
            </div>
            <div>
              <dt>Total yearly cost</dt>
              <dd>{formatCost(summary.estimated_total_yearly_cost, summary.currency, displayCurrency)}</dd>
            </div>
            <div>
              <dt>Application fee</dt>
              <dd>{formatCost(summary.application_fee, summary.currency, displayCurrency)}</dd>
            </div>
            <div>
              <dt>Insurance fee</dt>
              <dd>{formatCost(summary.insurance_fee, summary.currency, displayCurrency)}</dd>
            </div>
          </dl>
          <p className="muted-text" style={{ marginTop: '16px', fontSize: '0.82rem' }}>
            Verify deposits, travel, and one-time setup costs from official sources before making decisions.
          </p>
          <Link className="text-link" to={`/programs/${programId}`} style={{ display: 'inline-block', marginTop: '10px' }}>
            View full program detail →
          </Link>
        </InfoCard>
      ) : null}
    </div>
  )
}

export default CostCalculatorPage
