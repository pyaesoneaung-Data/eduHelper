import { useEffect, useState } from 'react'
import { getProgramDetail, getPrograms, getUniversities } from '../api/api'
import CompareTable from '../components/CompareTable'
import FormSection from '../components/FormSection'

function CompareProgramsPage() {
  const [programs, setPrograms] = useState([])
  const [universities, setUniversities] = useState([])
  const [programIds, setProgramIds] = useState({ first: '', second: '' })
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadPrograms() {
      try {
        const [programData, universityData] = await Promise.all([getPrograms(), getUniversities()])
        setPrograms(programData)
        setUniversities(universityData)
      } catch {
        setError('Unable to load programs for comparison.')
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
      const [firstDetail, secondDetail] = await Promise.all([
        getProgramDetail(programIds.first),
        getProgramDetail(programIds.second),
      ])

      function toRow(detail) {
        const req = detail.requirements?.[0]
        return {
          program_id: detail.program.program_id,
          major_name: detail.program.major_name,
          university: detail.university?.university_name ?? 'Not available',
          degree_level: detail.program.degree_level,
          instruction_language: detail.program.instruction_language ?? 'Not available',
          tuition_fee: detail.cost?.tuition_fee_per_semester ?? null,
          currency: detail.cost?.currency ?? null,
          living_cost: detail.cost?.avg_monthly_living_cost ?? null,
          min_gpa: req?.min_gpa ?? null,
          ielts_min: req?.ielts_min ?? null,
          application_deadline: detail.program.application_deadline ?? null,
        }
      }

      setRows([toRow(firstDetail), toRow(secondDetail)])
    } catch {
      setError('Comparison data could not be loaded.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-stack">
      <div className="section-heading">
        <h2>Compare Programs</h2>
        <p>Select two programs to compare tuition, living costs, GPA and IELTS requirements, and deadlines side by side.</p>
      </div>

      <form className="page-stack" onSubmit={handleSubmit}>
        <FormSection
          title="Comparison inputs"
          description="Choose any two programs from the list. All costs, requirements, and deadlines are pulled from the live database."
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
                  {`${universityMap[program.university_id] ?? 'Unknown university'} — ${program.major_name}`}
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
                  {`${universityMap[program.university_id] ?? 'Unknown university'} — ${program.major_name}`}
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
