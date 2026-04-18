import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProgramDetail } from '../api/api'
import InfoCard from '../components/InfoCard'
import PageHeader from '../components/PageHeader'

function ProgramDetailPage() {
  const { programId } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProgram() {
      try {
        const response = await getProgramDetail(programId)
        setData(response)
      } catch {
        setError('Program detail could not be loaded.')
      }
    }

    loadProgram()
  }, [programId])

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Program Detail"
        title={`Program overview for ${programId}`}
        description="This page keeps the existing detail endpoint as the source of truth for program, university, requirement, and cost information."
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
                <dd>{data.program?.application_deadline ?? 'Not listed'}</dd>
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
                <dd>{data.university?.country_id}</dd>
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
                  <a className="text-link" href={data.university?.official_website} target="_blank" rel="noreferrer">
                    Official website
                  </a>
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
                  <dd>{data.requirements[0].interview_required ? 'Yes' : 'No or not listed'}</dd>
                </div>
              </dl>
            ) : (
              <p className="muted-text">No requirement records were returned for this program.</p>
            )}
          </InfoCard>

          <InfoCard title="Cost information">
            {data.cost ? (
              <dl className="detail-grid">
                <div>
                  <dt>Tuition per semester</dt>
                  <dd>{data.cost.tuition_fee_per_semester} {data.cost.currency}</dd>
                </div>
                <div>
                  <dt>Monthly living cost</dt>
                  <dd>{data.cost.avg_monthly_living_cost} {data.cost.currency}</dd>
                </div>
              <div>
                <dt>Application fee</dt>
                <dd>{data.cost.application_fee ? `${data.cost.application_fee} ${data.cost.currency}` : 'Not listed'}</dd>
              </div>
              <div>
                <dt>Insurance fee</dt>
                <dd>{data.cost.insurance_fee ? `${data.cost.insurance_fee} ${data.cost.currency}` : 'Not listed'}</dd>
              </div>
              </dl>
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
