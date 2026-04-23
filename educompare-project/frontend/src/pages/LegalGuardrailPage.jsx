import { useEffect, useState } from 'react'
import { getCountryRules } from '../api/api'
import InfoCard from '../components/InfoCard'
import PageHeader from '../components/PageHeader'

function formatPartTime(rule) {
  if (rule.part_time_allowed === true) return `Yes — up to ${rule.work_hour_limit} hrs/week`
  if (rule.part_time_allowed === false) return 'No'
  return 'Not listed'
}

function formatWorkHourLimit(rule) {
  if (rule.work_hour_limit != null) return `${rule.work_hour_limit} hrs/week`
  if (rule.part_time_allowed === false) return 'Not applicable'
  return 'Not listed'
}

function LegalGuardrailPage() {
  const [rules, setRules] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)
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

  function toggleCountry(countryId) {
    setSelectedCountry((prev) => (prev === countryId ? null : countryId))
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Legal Info"
        title="Work and visa rules by country"
        description="Check part-time work rights, permit requirements, and post-study visa options before trusting any income claims from agents or sales materials."
      />

      {error ? <p className="error-text">{error}</p> : null}

      <InfoCard title="Important reminder" eyebrow="Before you decide" tone="muted">
        <p>Any agent claim about easy part-time income should be verified against the official permit rules and visa conditions for that country before you commit to anything.</p>
      </InfoCard>

      <InfoCard title="Compare countries" eyebrow="Planned feature">
        <p>
          A dedicated <strong>Compare Countries</strong> tool is planned for the Decision Hub —
          letting you pick any two countries from a dropdown and see a live side-by-side of visa type, work rights, and post-study options.
          For now, use the country list below to open and read each country's rules individually.
        </p>
      </InfoCard>

      {!rules.length && !error ? <p className="muted-text">Loading country rules...</p> : null}

      {rules.length ? (
        <div className="panel">
          <div className="panel-heading">
            <h2>Country rules</h2>
            <p>Select a country to read its full visa and work rules.</p>
          </div>

          <div className="legal-country-list">
            {rules.map((rule) => {
              const isOpen = selectedCountry === rule.country_id

              return (
                <div key={rule.country_id} className={`legal-country-item${isOpen ? ' legal-country-item--open' : ''}`}>
                  <button
                    className="legal-country-toggle"
                    onClick={() => toggleCountry(rule.country_id)}
                    type="button"
                    aria-expanded={isOpen}
                  >
                    <span className="legal-country-toggle-name">{rule.country_name}</span>
                    <span className="legal-country-toggle-hint">
                      {isOpen ? 'Close' : 'View rules'}
                    </span>
                    <span className="legal-country-toggle-arrow" aria-hidden="true">
                      {isOpen ? '↑' : '↓'}
                    </span>
                  </button>

                  {isOpen ? (
                    <div className="legal-country-detail">
                      <dl className="detail-grid compact">
                        <div>
                          <dt>Visa type</dt>
                          <dd>{rule.visa_type ?? 'Not listed'}</dd>
                        </div>
                        <div>
                          <dt>Part-time allowed</dt>
                          <dd>{formatPartTime(rule)}</dd>
                        </div>
                        <div>
                          <dt>Work hour limit</dt>
                          <dd>{formatWorkHourLimit(rule)}</dd>
                        </div>
                        <div>
                          <dt>Work permit required</dt>
                          <dd>{rule.work_permit_required ? 'Yes' : 'No'}</dd>
                        </div>
                        <div>
                          <dt>Post-study work visa</dt>
                          <dd>{rule.post_study_work_visa ?? 'Not listed'}</dd>
                        </div>
                      </dl>

                      {rule.visa_notes ? (
                        <div className="legal-visa-notes">
                          <p className="home-mini-label">Visa notes</p>
                          <p>{rule.visa_notes}</p>
                        </div>
                      ) : null}

                      {rule.source_url ? (
                        <div className="legal-source">
                          <a className="text-link" href={rule.source_url} target="_blank" rel="noreferrer">
                            Official source ↗
                          </a>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default LegalGuardrailPage
