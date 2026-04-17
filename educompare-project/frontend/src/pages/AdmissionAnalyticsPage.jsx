import { useEffect, useMemo, useState } from 'react'
import { getAdmissionAnalytics } from '../api/api'
import InfoCard from '../components/InfoCard'
import PageHeader from '../components/PageHeader'

function formatRequirementValue(value) {
  if (value === null || value === undefined) {
    return 'Not available'
  }

  return Number(value).toFixed(2)
}

function ComparisonRow({ label, taiwanValue, thailandValue, maxValue }) {
  const taiwanWidth = maxValue > 0 ? `${(taiwanValue / maxValue) * 100}%` : '0%'
  const thailandWidth = maxValue > 0 ? `${(thailandValue / maxValue) * 100}%` : '0%'

  return (
    <div className="comparison-row">
      <div className="comparison-label">{label}</div>
      <div className="comparison-bars">
        <div className="comparison-country">
          <div className="comparison-country-head">
            <span>Taiwan</span>
            <strong>{formatRequirementValue(taiwanValue)}</strong>
          </div>
          <div className="comparison-track">
            <div className="comparison-fill comparison-fill-taiwan" style={{ width: taiwanWidth }} />
          </div>
        </div>
        <div className="comparison-country">
          <div className="comparison-country-head">
            <span>Thailand</span>
            <strong>{formatRequirementValue(thailandValue)}</strong>
          </div>
          <div className="comparison-track">
            <div className="comparison-fill comparison-fill-thailand" style={{ width: thailandWidth }} />
          </div>
        </div>
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
                  <td>{program.major_name}</td>
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

function buildInsights(taiwan, thailand) {
  const insights = []

  if (
    taiwan?.average_min_gpa !== null &&
    taiwan?.average_min_gpa !== undefined &&
    thailand?.average_min_gpa !== null &&
    thailand?.average_min_gpa !== undefined
  ) {
    if (taiwan.average_min_gpa < thailand.average_min_gpa) {
      insights.push('Taiwan has lower GPA requirements on average in the current dataset.')
    } else if (thailand.average_min_gpa < taiwan.average_min_gpa) {
      insights.push('Thailand has lower GPA requirements on average in the current dataset.')
    } else {
      insights.push('Taiwan and Thailand show the same average GPA requirement in the current dataset.')
    }
  }

  if (
    taiwan?.average_ielts !== null &&
    taiwan?.average_ielts !== undefined &&
    thailand?.average_ielts !== null &&
    thailand?.average_ielts !== undefined
  ) {
    if (taiwan.average_ielts < thailand.average_ielts) {
      insights.push('Taiwan shows a lower average IELTS threshold than Thailand.')
    } else if (thailand.average_ielts < taiwan.average_ielts) {
      insights.push('Thailand shows a lower average IELTS threshold than Taiwan.')
    } else {
      insights.push('Average IELTS thresholds are the same across both countries in the current dataset.')
    }
  }

  return insights.slice(0, 2)
}

function mergeRankedPrograms(taiwanPrograms = [], thailandPrograms = [], direction = 'asc') {
  const merged = [...taiwanPrograms, ...thailandPrograms]
  const sortFactor = direction === 'asc' ? 1 : -1

  return merged
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

  const taiwan = data?.countries?.taiwan
  const thailand = data?.countries?.thailand

  const comparisonMax = useMemo(() => {
    if (!data) {
      return { gpa: 0, ielts: 0 }
    }

    return {
      gpa: Math.max(taiwan.average_min_gpa ?? 0, thailand.average_min_gpa ?? 0),
      ielts: Math.max(taiwan.average_ielts ?? 0, thailand.average_ielts ?? 0),
    }
  }, [data, taiwan, thailand])

  const easiestPrograms = useMemo(
    () => mergeRankedPrograms(taiwan?.easiest_programs, thailand?.easiest_programs, 'asc'),
    [taiwan, thailand],
  )

  const hardestPrograms = useMemo(
    () => mergeRankedPrograms(taiwan?.hardest_programs, thailand?.hardest_programs, 'desc'),
    [taiwan, thailand],
  )

  const insights = useMemo(() => buildInsights(taiwan, thailand), [taiwan, thailand])

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Admission Analytics"
        title="Compare admission difficulty between Taiwan and Thailand using real requirement data."
        description="This dashboard summarizes GPA and IELTS thresholds from the current dataset so students can spot lower-barrier and higher-barrier options more clearly."
      />

      {error ? <p className="error-text">{error}</p> : null}

      {data ? (
        <>
          <div className="card-grid">
            <InfoCard title="Avg GPA: Taiwan">
              <p className="kpi-value">{formatRequirementValue(taiwan.average_min_gpa)}</p>
            </InfoCard>
            <InfoCard title="Avg GPA: Thailand">
              <p className="kpi-value">{formatRequirementValue(thailand.average_min_gpa)}</p>
            </InfoCard>
            <InfoCard title="Avg IELTS: Taiwan">
              <p className="kpi-value">{formatRequirementValue(taiwan.average_ielts)}</p>
            </InfoCard>
            <InfoCard title="Avg IELTS: Thailand">
              <p className="kpi-value">{formatRequirementValue(thailand.average_ielts)}</p>
            </InfoCard>
          </div>

          <InfoCard title="Admission requirement comparison">
            <div className="comparison-stack">
              <ComparisonRow
                label="Average GPA requirement"
                taiwanValue={taiwan.average_min_gpa ?? 0}
                thailandValue={thailand.average_min_gpa ?? 0}
                maxValue={comparisonMax.gpa}
              />
              <ComparisonRow
                label="Average IELTS requirement"
                taiwanValue={taiwan.average_ielts ?? 0}
                thailandValue={thailand.average_ielts ?? 0}
                maxValue={comparisonMax.ielts}
              />
            </div>
          </InfoCard>

          <div className="two-column-grid">
            <ProgramsTable title="Easiest Programs" programs={easiestPrograms} />
            <ProgramsTable title="Hardest Programs" programs={hardestPrograms} />
          </div>

          <InfoCard title="Insights">
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
