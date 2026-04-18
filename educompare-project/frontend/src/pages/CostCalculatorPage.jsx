import { useEffect, useState } from 'react'
import { getCostSummary, getPrograms } from '../api/api'
import FormSection from '../components/FormSection'
import InfoCard from '../components/InfoCard'

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
      <div className="section-heading">
        <h2>Cost Calculator</h2>
        <p>Use the existing cost summary endpoint to review yearly burden, not just tuition alone.</p>
      </div>

      <form className="page-stack" onSubmit={handleSubmit}>
        <FormSection
          title="Program selection"
          description="Choose a live program and return the backend-calculated tuition, living cost, and total yearly estimate."
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
                <dt>Total yearly cost</dt>
                <dd>{summary.estimated_total_yearly_cost} {summary.currency}</dd>
              </div>
              <div>
                <dt>Application fee</dt>
                <dd>{summary.application_fee ? `${summary.application_fee} ${summary.currency}` : 'Not listed'}</dd>
              </div>
              <div>
                <dt>Insurance fee</dt>
                <dd>{summary.insurance_fee ? `${summary.insurance_fee} ${summary.currency}` : 'Not listed'}</dd>
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
