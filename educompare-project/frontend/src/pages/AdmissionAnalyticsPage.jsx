import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdmissionAnalytics } from '../api/api'
import InfoCard from '../components/InfoCard'

const COUNTRY_LABEL = {
  taiwan: 'Taiwan',
  thailand: 'Thailand',
  singapore: 'Singapore',
}

const COUNTRY_FILL_CLASS = {
  taiwan: 'comparison-fill-taiwan',
  thailand: 'comparison-fill-thailand',
  singapore: 'comparison-fill-singapore',
}

function formatRequirementValue(value) {
  if (value === null || value === undefined) {
    return 'Not available'
  }

  return Number(value).toFixed(2)
}

function ComparisonRow({ label, entries, maxValue }) {
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
                  className={`comparison-fill ${COUNTRY_FILL_CLASS[key] ?? 'comparison-fill-taiwan'}`}
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
    <InfoCard title={title}>
      {programs.length ? (
        <div className="table-shell">
          <table className="compare-table">
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
                    <Link className="text-link" to={`/programs/${program.program_id}`}>
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
    </InfoCard>
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
          <div className="card-grid">
            {countryKeys.map((key) => (
              <InfoCard key={`gpa-${key}`} title={`Avg GPA: ${COUNTRY_LABEL[key] ?? key}`}>
                <p className="kpi-value">{formatRequirementValue(countryData[key]?.average_min_gpa)}</p>
              </InfoCard>
            ))}
            {countryKeys.map((key) => (
              <InfoCard key={`ielts-${key}`} title={`Avg IELTS: ${COUNTRY_LABEL[key] ?? key}`}>
                <p className="kpi-value">{formatRequirementValue(countryData[key]?.average_ielts)}</p>
              </InfoCard>
            ))}
          </div>

          <InfoCard title="Admission Requirement Comparison">
            <div className="comparison-stack">
              <ComparisonRow
                label="Average GPA requirement"
                entries={countryKeys.map((key) => ({
                  key,
                  value: countryData[key]?.average_min_gpa ?? 0,
                }))}
                maxValue={comparisonMax.gpa}
              />
              <ComparisonRow
                label="Average IELTS requirement"
                entries={countryKeys.map((key) => ({
                  key,
                  value: countryData[key]?.average_ielts ?? 0,
                }))}
                maxValue={comparisonMax.ielts}
              />
            </div>
          </InfoCard>

          <div className="two-column-grid">
            <ProgramsTable title="Lowest-Barrier Programs" programs={easiestPrograms} />
            <ProgramsTable title="Highest-Barrier Programs" programs={hardestPrograms} />
          </div>

          <InfoCard title="Key Insights">
            {insights.length ? (
              <ul className="content-list">
                {insights.map((insight) => (
                  <li key={insight}>{insight}</li>
                ))}
              </ul>
            ) : (
              <p className="muted-text">Not enough GPA and IELTS data is available to generate insights yet.</p>
            )}
          </InfoCard>
        </>
      ) : null}
    </div>
  )
}

export default AdmissionAnalyticsPage
