import { useEffect, useState } from 'react'
import { getCountryRules } from '../api/api'
import InfoCard from '../components/InfoCard'
import PageHeader from '../components/PageHeader'

function LegalGuardrailPage() {
  const [rules, setRules] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadRules() {
      try {
        const data = await getCountryRules()
        setRules(data)
      } catch {
        setError('Country rule data could not be loaded.')
      }
    }

    loadRules()
  }, [])

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Legal Guardrail"
        title="Check legal study and work rules before trusting income promises."
        description="This page focuses on verified visa notes, work hour limits, permit requirements, and post-study visa information."
      />

      {error ? <p className="error-text">{error}</p> : null}

      <div className="card-grid">
        {rules.map((rule) => (
          <InfoCard key={rule.country_id} title={rule.country_name}>
            <dl className="detail-grid">
              <div>
                <dt>Country</dt>
                <dd>{rule.country_name}</dd>
              </div>
              <div>
                <dt>Visa type</dt>
                <dd>{rule.visa_type}</dd>
              </div>
              <div>
                <dt>Part-time allowed</dt>
                <dd>{rule.part_time_allowed ? 'Yes' : 'No or restricted'}</dd>
              </div>
              <div>
                <dt>Work hour limit</dt>
                <dd>{rule.work_hour_limit ?? 'Not listed'}</dd>
              </div>
              <div>
                <dt>Work permit required</dt>
                <dd>{rule.work_permit_required ? 'Yes' : 'No'}</dd>
              </div>
              <div>
                <dt>Visa notes</dt>
                <dd>{rule.visa_notes ?? 'Not listed'}</dd>
              </div>
              <div>
                <dt>Post-study work visa</dt>
                <dd>{rule.post_study_work_visa ?? 'Not listed'}</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>
                  <a className="text-link" href={rule.source_url} target="_blank" rel="noreferrer">
                    Official source
                  </a>
                </dd>
              </div>
            </dl>
          </InfoCard>
        ))}
      </div>
    </div>
  )
}

export default LegalGuardrailPage
