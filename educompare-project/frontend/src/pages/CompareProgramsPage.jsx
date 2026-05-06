import { useEffect, useMemo, useState } from 'react'
import { getProgramDetail, getPrograms, getUniversities } from '../api/api'
import CompareTable from '../components/CompareTable'
import FormSection from '../components/FormSection'

const COUNTRY_NAMES = { C001: 'Taiwan', C002: 'Thailand', C003: 'Singapore' }
const COUNTRY_ORDER = ['C001', 'C002', 'C003']
const SESSION_KEY = 'unimatch_compare'

function CompareProgramsPage() {
  const [programs, setPrograms] = useState([])
  const [universities, setUniversities] = useState([])
  const [programIds, setProgramIds] = useState({ first: '', second: '' })
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Restore state after back navigation
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY)
      if (saved) {
        const { programIds: savedIds, rows: savedRows } = JSON.parse(saved)
        if (savedIds) setProgramIds(savedIds)
        if (savedRows) setRows(savedRows)
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
        setError('Unable to load programs for comparison.')
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

    if (!programIds.first || !programIds.second) {
      setError('Select two programs to compare.')
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

      const newRows = [toRow(firstDetail), toRow(secondDetail)]
      setRows(newRows)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ programIds, rows: newRows }))
    } catch {
      setError('Comparison data could not be loaded.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  function programSelect(which) {
    return (
      <label>
        {which === 'first' ? 'First program' : 'Second program'}
        <select
          value={programIds[which]}
          onChange={(event) => setProgramIds((current) => ({ ...current, [which]: event.target.value }))}
        >
          <option value="">Select program</option>
          {COUNTRY_ORDER.map((countryId) =>
            programsByCountry[countryId]?.length ? (
              <optgroup key={countryId} label={COUNTRY_NAMES[countryId]}>
                {programsByCountry[countryId].map((program) => (
                  <option key={program.program_id} value={program.program_id}>
                    {`${universityMap[program.university_id]?.university_name ?? 'Unknown university'} — ${program.major_name}`}
                  </option>
                ))}
              </optgroup>
            ) : null,
          )}
        </select>
      </label>
    )
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
          {programSelect('first')}
          {programSelect('second')}
        </FormSection>

        <div className="action-row">
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Loading comparison...' : 'Compare programs'}
          </button>
          <button
            type="button"
            className="secondary-button"
            disabled={!programIds.first && !programIds.second && !rows.length}
            onClick={() => {
              setProgramIds({ first: '', second: '' })
              setRows([])
              setError('')
              sessionStorage.removeItem(SESSION_KEY)
            }}
          >
            Clear
          </button>
        </div>
      </form>

      {error ? <p className="error-text">{error}</p> : null}
      <CompareTable rows={rows} />
    </div>
  )
}

export default CompareProgramsPage
