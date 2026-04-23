import { useEffect, useState } from 'react'
import { getCostSummary, getPrograms, getUniversities } from '../api/api'
import { useAppShell } from '../context/AppShellContext'
import { convertCurrency } from '../utils/currency'
import FormSection from '../components/FormSection'
import InfoCard from '../components/InfoCard'

function formatCost(value, nativeCurrency, displayCurrency) {
  if (value === null || value === undefined) return 'Not listed'
  const isUSD = displayCurrency === 'USD'
  const amount = isUSD ? convertCurrency(Number(value), nativeCurrency, 'USD') : Number(value)
  const label = isUSD ? 'USD' : (nativeCurrency ?? '')
  return `${Math.round(amount).toLocaleString()} ${label}`.trim()
}

function CostCalculatorPage() {
  const { currency: displayCurrency, toggleCurrency } = useAppShell()
  const [programs, setPrograms] = useState([])
  const [universities, setUniversities] = useState([])
  const [programId, setProgramId] = useState('')
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

  const universityMap = universities.reduce((map, university) => {
    map[university.university_id] = university.university_name
    return map
  }, {})

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
    } catch {
      setSummary(null)
      setError('Cost summary could not be loaded for that program.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-stack">
      <div className="section-heading">
        <h2>Cost Calculator</h2>
        <p>See the full yearly cost picture — tuition, living costs, fees — not just the headline tuition figure agents usually show.</p>
      </div>

      <form className="page-stack" onSubmit={handleSubmit}>
        <FormSection
          title="Program selection"
          description="Select a program to see the full yearly cost breakdown — tuition, living costs, application fee, and insurance."
        >
          <label>
            Program
            <select value={programId} onChange={(event) => setProgramId(event.target.value)}>
              <option value="">Select program</option>
              {programs.map((program) => (
                <option key={program.program_id} value={program.program_id}>
                  {`${universityMap[program.university_id] ?? 'Unknown university'} — ${program.major_name}`}
                </option>
              ))}
            </select>
          </label>
        </FormSection>

        <div className="action-row">
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate yearly cost'}
          </button>
        </div>
      </form>

      {error ? <p className="error-text">{error}</p> : null}

      {summary ? (
        <div className="two-column-grid">
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
          </InfoCard>

          <InfoCard title="Interpretation note" tone="muted">
            <p>
              This view is meant to expose real yearly burden. Students should still verify deposits,
              travel, and one-time setup costs from official sources.
            </p>
          </InfoCard>
        </div>
      ) : null}
    </div>
  )
}

export default CostCalculatorPage
