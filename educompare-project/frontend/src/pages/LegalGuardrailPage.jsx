import { useEffect, useState } from 'react'
import { getCountryRules } from '../api/api'
import InfoCard from '../components/InfoCard'
import PageHeader from '../components/PageHeader'

function findCountryRule(rules, keyword) {
  return rules.find((rule) => rule.country_name?.toLowerCase().includes(keyword))
}

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

  const taiwanRule = findCountryRule(rules, 'taiwan')
  const thailandRule = findCountryRule(rules, 'thailand')

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Legal Info"
        title="Legal work and visa rules should be checked before tuition promises or part-time income claims are trusted."
        description="This workspace keeps work rights, permit requirements, and visa notes in a readable dashboard format so students can compare country constraints before deciding."
      />

      {error ? <p className="error-text">{error}</p> : null}

      <div className="card-grid">
        <InfoCard title="Countries covered" eyebrow="Overview">
          <p className="kpi-value">{rules.length}</p>
          <p className="muted-text">Current legal rule records loaded from the backend.</p>
        </InfoCard>
        <InfoCard title="Taiwan check" eyebrow="Work rights">
          <p>{taiwanRule ? `${taiwanRule.work_hour_limit ?? 'Not listed'} hrs/week with permit review` : 'Taiwan rule record is not available yet.'}</p>
        </InfoCard>
        <InfoCard title="Thailand check" eyebrow="Work rights">
          <p>{thailandRule ? `${thailandRule.part_time_allowed ? 'Part-time rights listed with restrictions' : 'Very limited or restricted work rights listed'}` : 'Thailand rule record is not available yet.'}</p>
        </InfoCard>
        <InfoCard title="Guardrail" eyebrow="Decision note" tone="muted">
          <p>Any agent claim about easy income should be checked against permit rules and official visa notes first.</p>
        </InfoCard>
      </div>

      <div className="card-grid">
        {rules.map((rule) => (
          <InfoCard key={rule.country_id} title={rule.country_name} eyebrow="Country rule">
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
                  {rule.source_url ? (
                    <a className="text-link" href={rule.source_url} target="_blank" rel="noreferrer">
                      Official source
                    </a>
                  ) : (
                    'Not listed'
                  )}
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
