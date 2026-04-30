import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProgramDetail } from '../api/api'
import { useAppShell } from '../context/AppShellContext'
import { convertCurrency } from '../utils/currency'
import { isDeadlinePassed } from '../utils/date'
import InfoCard from '../components/InfoCard'
import PageHeader from '../components/PageHeader'
import BackButton from '../components/BackButton'

const COUNTRY_NAMES = {
  C001: 'Taiwan',
  C002: 'Thailand',
  C003: 'Singapore',
}

function formatCost(value, nativeCurrency, displayCurrency) {
  if (value === null || value === undefined) return 'Not listed'
  const isUSD = displayCurrency === 'USD'
  const amount = isUSD ? convertCurrency(Number(value), nativeCurrency, 'USD') : Number(value)
  const label = isUSD ? 'USD' : (nativeCurrency ?? '')
  return `${Math.round(amount).toLocaleString()} ${label}`.trim()
}

function formatBool(value) {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return 'Not listed'
}

function ProgramDetailPage() {
  const { programId } = useParams()
  const { currency: displayCurrency, toggleCurrency } = useAppShell()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const deadlinePassed = isDeadlinePassed(data?.program?.application_deadline)

  useEffect(() => {
    async function loadProgram() {
      try {
        const response = await getProgramDetail(programId)
        setData(response)
      } catch (err) {
        if (err?.response?.status === 404) {
          setError(`Program "${programId}" was not found in the database.`)
        } else {
          setError('Program detail could not be loaded.')
        }
      }
    }

    loadProgram()
  }, [programId])

  return (
    <div className="page-stack">
      <BackButton fallback="/" />
      <PageHeader
        eyebrow="Program Detail"
        title={data ? data.program.major_name : error ? 'Program not found' : 'Loading...'}
        description="Verified program, university, admission requirement, and cost information from the database."
      />

      {error ? <p className="error-text">{error}</p> : null}

      {data ? (
        <div className="card-grid">
          <InfoCard title="Program information">
            <dl className="detail-grid">
              <div>
                <dt>Program</dt>
                <dd>{data.program?.major_name}</dd>
              </div>
              <div>
                <dt>Degree</dt>
                <dd>{data.program?.degree_level}</dd>
              </div>
              <div>
                <dt>Language</dt>
                <dd>{data.program?.instruction_language}</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{data.program?.duration_years ? `${data.program.duration_years} years` : 'Not listed'}</dd>
              </div>
              <div>
                <dt>Intake</dt>
                <dd>{data.program?.intake ?? 'Not listed'}</dd>
              </div>
              <div>
                <dt>Deadline</dt>
                <dd className={deadlinePassed ? 'deadline-passed' : ''}>
                  {data.program?.application_deadline ?? 'Not listed'}
                  {deadlinePassed ? ' — Deadline passed' : ''}
                </dd>
              </div>
            </dl>
          </InfoCard>

          <InfoCard title="University information">
            <dl className="detail-grid">
              <div>
                <dt>University</dt>
                <dd>{data.university?.university_name}</dd>
              </div>
              <div>
                <dt>Country</dt>
                <dd>{COUNTRY_NAMES[data.university?.country_id] ?? data.university?.country_id}</dd>
              </div>
              <div>
                <dt>City</dt>
                <dd>{data.university?.city ?? 'Not listed'}</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{data.university?.university_type ?? 'Not listed'}</dd>
              </div>
              <div>
                <dt>Website</dt>
                <dd>
                  {data.university?.official_website ? (
                    <a className="text-link" href={data.university.official_website} target="_blank" rel="noreferrer">
                      Official website
                    </a>
                  ) : (
                    'Not listed'
                  )}
                </dd>
              </div>
            </dl>
          </InfoCard>

          <InfoCard title="Admission requirements">
            {data.requirements?.length ? (
              <dl className="detail-grid">
                <div>
                  <dt>Minimum GPA</dt>
                  <dd>{data.requirements[0].min_gpa ?? 'Not listed'}</dd>
                </div>
                <div>
                  <dt>Minimum IELTS</dt>
                  <dd>{data.requirements[0].ielts_min ?? 'Not listed'}</dd>
                </div>
                <div>
                  <dt>Documents</dt>
                  <dd>{data.requirements[0].documents_required ?? 'Not listed'}</dd>
                </div>
                <div>
                  <dt>Interview required</dt>
                  <dd>{formatBool(data.requirements[0].interview_required)}</dd>
                </div>
              </dl>
            ) : (
              <p className="muted-text">No requirement records were returned for this program.</p>
            )}
          </InfoCard>

          <InfoCard title="Cost information">
            {data.cost ? (
              <>
                <p className="muted-text" style={{ marginBottom: '12px' }}>
                  {displayCurrency === 'USD' ? 'Costs converted to USD. ' : `Costs shown in ${data.cost.currency}. `}
                  <button type="button" className="text-button" onClick={toggleCurrency}>
                    {displayCurrency === 'USD' ? 'Switch to native →' : 'Switch to USD →'}
                  </button>
                </p>
                <dl className="detail-grid">
                  <div>
                    <dt>Tuition per semester</dt>
                    <dd>{formatCost(data.cost.tuition_fee_per_semester, data.cost.currency, displayCurrency)}</dd>
                  </div>
                  <div>
                    <dt>Monthly living cost</dt>
                    <dd>{formatCost(data.cost.avg_monthly_living_cost, data.cost.currency, displayCurrency)}</dd>
                  </div>
                  <div>
                    <dt>Application fee</dt>
                    <dd>{formatCost(data.cost.application_fee, data.cost.currency, displayCurrency)}</dd>
                  </div>
                  <div>
                    <dt>Insurance fee</dt>
                    <dd>{formatCost(data.cost.insurance_fee, data.cost.currency, displayCurrency)}</dd>
                  </div>
                </dl>
              </>
            ) : (
              <p className="muted-text">No cost record was returned for this program.</p>
            )}
          </InfoCard>
        </div>
      ) : null}
    </div>
  )
}

export default ProgramDetailPage
