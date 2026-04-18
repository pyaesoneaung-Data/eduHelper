import { useEffect, useState } from 'react'
import { getComparePrograms, getProgramDetail, getPrograms, getRequirements } from '../api/api'
import CompareTable from '../components/CompareTable'
import FormSection from '../components/FormSection'

function CompareProgramsPage() {
  const [programs, setPrograms] = useState([])
  const [programIds, setProgramIds] = useState({ first: '', second: '' })
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadPrograms() {
      try {
        const data = await getPrograms()
        setPrograms(data)
      } catch {
        setError('Unable to load programs for comparison.')
      }
    }

    loadPrograms()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()

    if (!programIds.first || !programIds.second) {
      setError('Select two program IDs to compare.')
      return
    }

    if (programIds.first === programIds.second) {
      setError('Choose two different programs.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const compareData = await getComparePrograms([programIds.first, programIds.second])
      const enriched = await Promise.all(
        compareData.map(async (item) => {
          const [detail, requirements] = await Promise.all([
            getProgramDetail(item.program_id),
            getRequirements({ program_id: item.program_id }),
          ])

          const requirement = requirements[0]

          return {
            ...item,
            instruction_language: detail.program?.instruction_language ?? 'Not available',
            application_deadline: detail.program?.application_deadline ?? 'Not available',
            min_gpa: requirement?.min_gpa ?? 'Not listed',
            ielts_min: requirement?.ielts_min ?? 'Not listed',
          }
        }),
      )

      setRows(enriched)
    } catch {
      setError('Comparison data could not be loaded. Check the selected IDs and backend service.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-stack">
      <div className="section-heading">
        <h2>Compare</h2>
        <p>Use the current compare endpoint, then enrich the table with existing requirement and detail endpoints.</p>
      </div>

      <form className="page-stack" onSubmit={handleSubmit}>
        <FormSection
          title="Comparison inputs"
          description="Select two live program records and compare tuition, living cost, GPA, IELTS, and deadlines side by side."
        >
          <label>
            First program
            <select
              value={programIds.first}
              onChange={(event) => setProgramIds((current) => ({ ...current, first: event.target.value }))}
            >
              <option value="">Select program</option>
              {programs.map((program) => (
                <option key={program.program_id} value={program.program_id}>
                  {program.program_id} - {program.major_name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Second program
            <select
              value={programIds.second}
              onChange={(event) => setProgramIds((current) => ({ ...current, second: event.target.value }))}
            >
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
            {loading ? 'Loading comparison...' : 'Compare programs'}
          </button>
        </div>
      </form>

      {error ? <p className="error-text">{error}</p> : null}
      <CompareTable rows={rows} />
    </div>
  )
}

export default CompareProgramsPage
