import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactCountryFlag from 'react-country-flag'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getAdmissionAnalytics } from '../api/api'

const COUNTRY_LABEL = {
  taiwan: 'Taiwan',
  thailand: 'Thailand',
  singapore: 'Singapore',
}

const SNAPSHOT_COUNTRY_KEYS = ['taiwan', 'thailand', 'singapore']

const COUNTRY_CODE = {
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

const ADMISSION_TOOLTIP_STYLE = {
  background: 'var(--panel-bg)',
  border: '1px solid var(--border)',
  borderRadius: '4px',
  color: 'var(--text)',
  fontSize: '0.82rem',
}

function AdmissionComparisonChart({ countryKeys, countryData }) {
  const barData = countryKeys.map((key) => ({
    country: COUNTRY_LABEL[key] ?? key,
    gpa: isAvailable(countryData[key]?.average_min_gpa)
      ? Number(Number(countryData[key].average_min_gpa).toFixed(2))
      : undefined,
    ielts: isAvailable(countryData[key]?.average_ielts)
      ? Number(Number(countryData[key].average_ielts).toFixed(2))
      : undefined,
  }))

  return (
    <section className="admission-overview-card admission-comparison-card">
      <div className="admission-card-head">
        <h3>Admission Requirement Comparison</h3>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={barData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="country"
            tick={{ fontSize: 12, fill: 'var(--text)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted)' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            formatter={(value, name) => [Number(value).toFixed(2), name]}
            contentStyle={ADMISSION_TOOLTIP_STYLE}
            itemStyle={{ color: 'var(--text)' }}
            labelStyle={{ color: 'var(--text)', fontWeight: 600, marginBottom: 2 }}
            cursor={{ fill: 'var(--border)', opacity: 0.5 }}
          />
          <Legend
            iconType="square"
            iconSize={10}
            verticalAlign="top"
            align="right"
            wrapperStyle={{ fontSize: '0.8rem', paddingBottom: '8px' }}
          />
          <Bar name="GPA" dataKey="gpa" fill="var(--accent)" radius={[3, 3, 0, 0]} />
          <Bar name="IELTS" dataKey="ielts" fill="#5a9e7a" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="muted-text" style={{ fontSize: '0.78rem' }}>
        GPA: 0–4.0 scale · IELTS: 0–9.0 scale
      </p>
    </section>
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
        <p>Compare GPA and IELTS admission thresholds across Taiwan, Thailand, and Singapore.</p>
      </div>

      <p className="data-freshness-note">
        Dataset verified April 2026 — sourced from official university and government websites.
        Figures reflect the admission requirements recorded at that time.
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
                      <span className="admission-snapshot-flag">
                        {COUNTRY_CODE[key] ? (
                          <ReactCountryFlag
                            countryCode={COUNTRY_CODE[key]}
                            svg
                            style={{ width: '34px', height: '22px', display: 'block' }}
                            title={COUNTRY_LABEL[key] ?? key}
                          />
                        ) : null}
                      </span>
                      <h4>{COUNTRY_LABEL[key] ?? key}</h4>
                    </div>

                    <div className="admission-snapshot-status">
                      <span className="admission-snapshot-checkbox" aria-hidden="true">
                        {hasCompleteData ? '✓' : ''}
                      </span>
                      <span>{hasCompleteData ? 'Completed' : 'Partial Data'}</span>
                    </div>

                    <dl className="admission-snapshot-metrics">
                      <div className="admission-snapshot-metric">
                        <dt>Avg. Min. GPA</dt>
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
            <AdmissionComparisonChart
              countryKeys={countryKeys}
              countryData={countryData}
            />

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

          <div className="section-heading" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Program Rankings</h3>
            <p style={{ margin: 0 }}>Top 5 easiest and most competitive programs by GPA and IELTS thresholds.</p>
          </div>
          <div className="admission-bottom-grid">
            <ProgramsTable title="Easiest Programs to Enter" programs={easiestPrograms} />
            <ProgramsTable title="Most Competitive Programs" programs={hardestPrograms} />
          </div>
        </>
      ) : null}
    </div>
  )
}

export default AdmissionAnalyticsPage
