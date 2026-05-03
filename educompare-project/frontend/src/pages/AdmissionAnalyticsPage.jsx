import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdmissionAnalytics } from '../api/api'

const COUNTRY_LABEL = {
  taiwan: 'Taiwan',
  thailand: 'Thailand',
  singapore: 'Singapore',
}

const SNAPSHOT_COUNTRY_KEYS = ['taiwan', 'thailand', 'singapore']

const COUNTRY_MARKER = {
  taiwan: 'TW',
  thailand: 'TH',
  singapore: 'SG',
}

function formatRequirementValue(value) {
  if (value === null || value === undefined) {
    return 'Not available'
  }

  return Number(value).toFixed(2)
}

function isAvailable(value) {
  if (value === null || value === undefined || value === '') {
    return false
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (!normalized || normalized === 'not available' || normalized === 'n/a') {
      return false
    }
  }

  const numericValue = Number(value)
  return Number.isFinite(numericValue) && numericValue > 0
}

function formatMetric(value) {
  return isAvailable(value) ? Number(value).toFixed(2) : 'Not available'
}

function ComparisonRow({ label, entries, maxValue, fillClass }) {
  // entries: [{ key, value }]
  return (
    <div className="comparison-row">
      <div className="comparison-label">{label}</div>
      <div className="comparison-bars">
        {entries.map(({ key, value }) => {
          const width = maxValue > 0 ? `${(value / maxValue) * 100}%` : '0%'
          return (
            <div key={key} className="comparison-country">
              <div className="comparison-country-head">
                <span>{COUNTRY_LABEL[key] ?? key}</span>
                <strong>{formatRequirementValue(value)}</strong>
              </div>
              <div className="comparison-track">
                <div
                  className={`comparison-fill ${fillClass}`}
                  style={{ width }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProgramsTable({ title, programs }) {
  return (
    <section className="admission-overview-card admission-programs-card">
      <div className="admission-card-head">
        <h3>{title}</h3>
      </div>
      {programs.length ? (
        <div className="table-shell admission-table-shell">
          <table className="compare-table admission-programs-table">
            <thead>
              <tr>
                <th>Program</th>
                <th>University</th>
                <th>GPA</th>
                <th>IELTS</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program) => (
                <tr key={`${title}-${program.country_id}-${program.program_id}`}>
                  <td>
                    <Link className="text-link admission-program-link" to={`/programs/${program.program_id}`}>
                      {program.major_name}
                    </Link>
                  </td>
                  <td>{program.university_name}</td>
                  <td>{formatRequirementValue(program.min_gpa)}</td>
                  <td>{formatRequirementValue(program.ielts_min)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="muted-text">No ranked programs were available in the dataset.</p>
      )}
    </section>
  )
}

function buildInsights(countryData) {
  const keys = Object.keys(countryData)
  const insights = []

  // GPA insight — find lowest and highest
  const gpaEntries = keys
    .map((k) => ({ key: k, value: countryData[k]?.average_min_gpa }))
    .filter((e) => e.value !== null && e.value !== undefined)

  if (gpaEntries.length >= 2) {
    const sorted = [...gpaEntries].sort((a, b) => a.value - b.value)
    const lowest = COUNTRY_LABEL[sorted[0].key] ?? sorted[0].key
    const highest = COUNTRY_LABEL[sorted[sorted.length - 1].key] ?? sorted[sorted.length - 1].key
    if (sorted[0].value !== sorted[sorted.length - 1].value) {
      insights.push(`${lowest} has the lowest average GPA requirement in the current dataset; ${highest} has the highest.`)
    } else {
      insights.push('All countries show the same average GPA requirement in the current dataset.')
    }
  }

  // IELTS insight — find lowest and highest
  const ieltsEntries = keys
    .map((k) => ({ key: k, value: countryData[k]?.average_ielts }))
    .filter((e) => e.value !== null && e.value !== undefined)

  if (ieltsEntries.length >= 2) {
    const sorted = [...ieltsEntries].sort((a, b) => a.value - b.value)
    const lowest = COUNTRY_LABEL[sorted[0].key] ?? sorted[0].key
    const highest = COUNTRY_LABEL[sorted[sorted.length - 1].key] ?? sorted[sorted.length - 1].key
    if (sorted[0].value !== sorted[sorted.length - 1].value) {
      insights.push(`${lowest} shows the lowest average IELTS threshold; ${highest} shows the highest.`)
    } else {
      insights.push('Average IELTS thresholds are the same across all countries in the current dataset.')
    }
  }

  return insights.slice(0, 2)
}

function mergeRankedPrograms(countryData, direction = 'asc') {
  const allPrograms = Object.values(countryData).flatMap(
    (c) => (direction === 'asc' ? c?.easiest_programs : c?.hardest_programs) ?? [],
  )
  const sortFactor = direction === 'asc' ? 1 : -1

  return allPrograms
    .slice()
    .sort((left, right) => {
      if (left.min_gpa !== right.min_gpa) {
        return (left.min_gpa - right.min_gpa) * sortFactor
      }

      if (left.ielts_min !== right.ielts_min) {
        return (left.ielts_min - right.ielts_min) * sortFactor
      }

      return left.major_name.localeCompare(right.major_name) * sortFactor
    })
    .slice(0, 5)
}

function AdmissionAnalyticsPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await getAdmissionAnalytics()
        setData(response)
      } catch {
        setError('Admission analytics data could not be loaded from the backend.')
      }
    }

    loadAnalytics()
  }, [])

  const countryData = data?.countries ?? {}
  const countryKeys = Object.keys(countryData)
  const snapshotCountryKeys = (() => {
    const orderedKeys = SNAPSHOT_COUNTRY_KEYS.filter((key) => countryKeys.includes(key))
    return orderedKeys.length ? orderedKeys : countryKeys
  })()

  const comparisonMax = useMemo(() => {
    if (!countryKeys.length) return { gpa: 0, ielts: 0 }
    return {
      gpa: Math.max(...countryKeys.map((k) => countryData[k]?.average_min_gpa ?? 0), 0),
      ielts: Math.max(...countryKeys.map((k) => countryData[k]?.average_ielts ?? 0), 0),
    }
  }, [countryData, countryKeys])

  const easiestPrograms = useMemo(
    () => mergeRankedPrograms(countryData, 'asc'),
    [countryData],
  )

  const hardestPrograms = useMemo(
    () => mergeRankedPrograms(countryData, 'desc'),
    [countryData],
  )

  const insights = useMemo(() => buildInsights(countryData), [countryData])

  return (
    <div className="page-stack">
      <div className="section-heading">
        <h2>Admission Overview</h2>
        <p>Compare GPA and IELTS thresholds using the backend admission analytics summary.</p>
      </div>

      <p className="data-freshness-note">
        Dataset verified April 2026 — sourced from official university and government websites.
        Figures reflect the intake cycle recorded at that time.
      </p>

      {error ? <p className="error-text">{error}</p> : null}

      {!data && !error ? <p className="muted-text">Loading admission data...</p> : null}

      {data ? (
        <>
          <section className="admission-snapshot-section" aria-labelledby="admission-snapshot-title">
            <div className="admission-snapshot-head">
              <h3 id="admission-snapshot-title">Admission Snapshot by Country</h3>
            </div>

            <div className="admission-snapshot-grid">
              {snapshotCountryKeys.map((key) => {
                const averageGpa = countryData[key]?.average_min_gpa
                const averageIelts = countryData[key]?.average_ielts
                const hasCompleteData = isAvailable(averageGpa) && isAvailable(averageIelts)

                return (
                  <article key={key} className="admission-snapshot-country">
                    <div className="admission-snapshot-country-head">
                      <span className="admission-snapshot-flag" aria-hidden="true">
                        {COUNTRY_MARKER[key] ?? '--'}
                      </span>
                      <h4>{COUNTRY_LABEL[key] ?? key}</h4>
                    </div>

                    <div className="admission-snapshot-status">
                      <span className="admission-snapshot-checkbox" aria-hidden="true">
                        {hasCompleteData ? 'x' : ''}
                      </span>
                      <span>{hasCompleteData ? 'Completed' : 'Partial Data'}</span>
                    </div>

                    <dl className="admission-snapshot-metrics">
                      <div className="admission-snapshot-metric">
                        <dt>Avg GPA</dt>
                        <dd>{formatMetric(averageGpa)}</dd>
                      </div>
                      <div className="admission-snapshot-divider" aria-hidden="true" />
                      <div className="admission-snapshot-metric">
                        <dt>Avg IELTS</dt>
                        <dd>{formatMetric(averageIelts)}</dd>
                      </div>
                    </dl>
                  </article>
                )
              })}
            </div>
          </section>

          <div className="admission-middle-grid">
            <section className="admission-overview-card admission-comparison-card">
              <div className="admission-card-head">
                <h3>Admission Requirement Comparison</h3>
              </div>

              <div className="admission-comparison-legend" aria-label="Chart legend">
                <span className="admission-legend-item">
                  <span className="admission-legend-swatch admission-legend-swatch-gpa" aria-hidden="true" />
                  GPA
                </span>
                <span className="admission-legend-item">
                  <span className="admission-legend-swatch admission-legend-swatch-ielts" aria-hidden="true" />
                  IELTS
                </span>
              </div>

              <div className="comparison-stack">
                <ComparisonRow
                  label="Average GPA requirement"
                  entries={countryKeys.map((key) => ({
                    key,
                    value: countryData[key]?.average_min_gpa ?? 0,
                  }))}
                  maxValue={comparisonMax.gpa}
                  fillClass="comparison-fill-gpa"
                />
                <ComparisonRow
                  label="Average IELTS requirement"
                  entries={countryKeys.map((key) => ({
                    key,
                    value: countryData[key]?.average_ielts ?? 0,
                  }))}
                  maxValue={comparisonMax.ielts}
                  fillClass="comparison-fill-ielts"
                />
              </div>

              <p className="admission-axis-label">Country Name</p>
            </section>

            <section className="admission-overview-card admission-insights-card">
              <div className="admission-card-head">
                <h3>Key Insights</h3>
              </div>

              {insights.length ? (
                <ul className="content-list admission-insight-list">
                  {insights.map((insight) => (
                    <li key={insight}>{insight}</li>
                  ))}
                </ul>
              ) : (
                <p className="muted-text">No insights available.</p>
              )}
            </section>
          </div>

          <div className="admission-bottom-grid">
            <ProgramsTable title="Lowest-Barrier Programs" programs={easiestPrograms} />
            <ProgramsTable title="Highest-Barrier Programs" programs={hardestPrograms} />
          </div>
        </>
      ) : null}
    </div>
  )
}

export default AdmissionAnalyticsPage
