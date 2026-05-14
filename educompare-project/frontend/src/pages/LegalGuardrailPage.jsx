import { useEffect, useState } from 'react'
import { getCountryRules } from '../api/api'
import InfoCard from '../components/InfoCard'

function LegalGuardrailPage() {
  const [rules, setRules] = useState([])
  const [openIds, setOpenIds] = useState(new Set())
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
    setOpenIds((prev) => {
      const next = new Set(prev)
      next.has(countryId) ? next.delete(countryId) : next.add(countryId)
      return next
    })
  }

  return (
    <div className="page-stack">
      <p className="page-description">
        Check part-time work rights, permit requirements, and post-study visa options before trusting any income claims from agents or promotional materials.
      </p>

      {error ? <p className="error-text">{error}</p> : null}

      <InfoCard title="Important reminder" eyebrow="Before you decide" tone="muted">
        <p>Any agent claim about easy part-time income should be verified against the official permit rules and visa conditions for that country before making any commitment.</p>
      </InfoCard>

      {!rules.length && !error ? <p className="muted-text">Loading country rules...</p> : null}

      {rules.length ? (
        <div className="panel">
          <div className="panel-heading">
            <h2>Country rules</h2>
            <p>Select one or more countries to read their visa and work rules.</p>
          </div>

          <div className="legal-country-list">
            {rules.map((rule) => {
              const isOpen = openIds.has(rule.country_id)

              return (
                <div key={rule.country_id} className={`legal-country-item${isOpen ? ' legal-country-item--open' : ''}`}>
                  <button
                    className="legal-country-toggle"
                    onClick={() => toggleCountry(rule.country_id)}
                    type="button"
                    aria-expanded={isOpen}
                  >
                    <span className="legal-country-toggle-name">{rule.country_name}</span>
                    {rule.part_time_allowed === true ? (
                      <span className="legal-badge legal-badge--ok">Part-time allowed</span>
                    ) : rule.part_time_allowed === false ? (
                      <span className="legal-badge legal-badge--no">No part-time</span>
                    ) : null}
                    <span className="legal-country-toggle-arrow" aria-hidden="true">
                      {isOpen ? '↑' : '↓'}
                    </span>
                  </button>

                  {isOpen ? (
                    <div className="legal-country-detail">
                      {rule.visa_notes ? (
                        <div className="legal-visa-notes legal-visa-notes--prominent">
                          <p className="home-mini-label">Visa notes</p>
                          <p>{rule.visa_notes}</p>
                        </div>
                      ) : null}

                      <dl className="detail-grid compact">
                        <div>
                          <dt>Visa type</dt>
                          <dd>{rule.visa_type ?? 'Not listed'}</dd>
                        </div>
                        <div>
                          <dt>Part-time work</dt>
                          <dd>
                            {rule.part_time_allowed === true
                              ? `Yes, up to ${rule.work_hour_limit} hrs/week`
                              : rule.part_time_allowed === false
                                ? 'Not permitted'
                                : 'Not listed'}
                          </dd>
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

      <InfoCard title="Compare countries" eyebrow="Planned feature">
        <p>
          A dedicated <strong>Compare Countries</strong> tool is planned for the Decision Hub,
          letting you pick any two countries and see a side-by-side view of visa type, work rights, and post-study options.
        </p>
      </InfoCard>
    </div>
  )
}

export default LegalGuardrailPage
