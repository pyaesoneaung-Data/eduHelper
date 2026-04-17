import { useEffect, useState } from 'react'
import { getCostSummary, getPrograms } from '../api/api'
import FormSection from '../components/FormSection'
import InfoCard from '../components/InfoCard'
import PageHeader from '../components/PageHeader'

function CostCalculatorPage() {
  const [programs, setPrograms] = useState([])
  const [programId, setProgramId] = useState('')
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadPrograms() {
      try {
        const data = await getPrograms()
        setPrograms(data)
      } catch {
        setError('Unable to load programs for the calculator.')
      }
    }

    loadPrograms()
  }, [])

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
      <PageHeader
        eyebrow="Real-Cost Calculator"
        title="Estimate the yearly financial burden, not just the tuition figure."
        description="This calculator uses the backend cost summary endpoint to expose hidden living expenses that are often left out of agent claims."
      />

      <form onSubmit={handleSubmit}>
        <FormSection
          title="Program selection"
          description="Choose a program ID to calculate semester tuition, yearly tuition, monthly living costs, and estimated total yearly cost."
        >
          <label>
            Program
            <select value={programId} onChange={(event) => setProgramId(event.target.value)}>
              <option value="">Select program</option>
              {programs.map((program) => (
                <option key={program.program_id} value={program.program_id}>
                  {program.program_id} - {program.major_name}
                </option>
              ))}
            </select>
          </label>
        </FormSection>

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate yearly cost'}
        </button>
      </form>

      {error ? <p className="error-text">{error}</p> : null}

      {summary ? (
        <div className="two-column-grid">
          <InfoCard title="Cost summary">
            <dl className="detail-grid">
              <div>
                <dt>Tuition per semester</dt>
                <dd>{summary.tuition_per_semester} {summary.currency}</dd>
              </div>
              <div>
                <dt>Yearly tuition</dt>
                <dd>{summary.yearly_tuition} {summary.currency}</dd>
              </div>
              <div>
                <dt>Monthly living cost</dt>
                <dd>{summary.monthly_living_cost} {summary.currency}</dd>
              </div>
              <div>
                <dt>Yearly living cost</dt>
                <dd>{summary.yearly_living_cost} {summary.currency}</dd>
              </div>
              <div>
                <dt>Estimated total yearly cost</dt>
                <dd>{summary.estimated_total_yearly_cost} {summary.currency}</dd>
              </div>
            </dl>
          </InfoCard>

          <InfoCard title="Important note" tone="muted">
            <p>This is an estimate. Actual costs may vary.</p>
          </InfoCard>
        </div>
      ) : null}
    </div>
  )
}

export default CostCalculatorPage
