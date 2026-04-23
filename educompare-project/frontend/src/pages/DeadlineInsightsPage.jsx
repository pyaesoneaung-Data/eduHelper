import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPrograms, getUniversities } from '../api/api'
import InfoCard from '../components/InfoCard'
import { getTodayAtStartOfDay, parseISODateOnly } from '../utils/date'

const COUNTRY_NAMES = {
  C001: 'Taiwan',
  C002: 'Thailand',
  C003: 'Singapore',
}

function daysUntil(dateStr) {
  const targetDate = parseISODateOnly(dateStr)
  if (!targetDate) return 0
  const today = getTodayAtStartOfDay()
  return Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24))
}

function daysSince(dateStr) {
  const targetDate = parseISODateOnly(dateStr)
  if (!targetDate) return 0
  const today = getTodayAtStartOfDay()
  return Math.ceil((today - targetDate) / (1000 * 60 * 60 * 24))
}

function formatDaysLeft(n) {
  if (n === 0) return 'Due today'
  return `${n} ${n === 1 ? 'day' : 'days'} left`
}

function formatDaysSince(n) {
  return `${n} ${n === 1 ? 'day' : 'days'} ago`
}

function DeadlineInsightsPage() {
  const [programs, setPrograms] = useState([])
  const [universities, setUniversities] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [programData, universityData] = await Promise.all([
          getPrograms(),
          getUniversities(),
        ])
        setPrograms(programData)
        setUniversities(universityData)
      } catch {
        setError('Deadline data could not be loaded from the backend.')
      }
    }
    load()
  }, [])

  const universityMap = useMemo(
    () => universities.reduce((map, u) => { map[u.university_id] = u; return map }, {}),
    [universities],
  )

  const enriched = useMemo(
    () =>
      programs
        .filter((p) => p.application_deadline)
        .map((p) => ({
          ...p,
          parsed_deadline: parseISODateOnly(p.application_deadline),
          university_name: universityMap[p.university_id]?.university_name ?? 'Unknown',
          country_id: universityMap[p.university_id]?.country_id ?? 'Unknown',
        }))
        .filter((p) => p.parsed_deadline)
        .sort((a, b) => a.parsed_deadline - b.parsed_deadline),
    [programs, universityMap],
  )

  const today = getTodayAtStartOfDay()
  const upcoming = enriched.filter((p) => p.parsed_deadline >= today)
  const passed = [...enriched.filter((p) => p.parsed_deadline < today)].reverse()
  const nextDeadline = upcoming[0] ?? null

  return (
    <div className="page-stack">
      <div className="section-heading">
        <h2>Deadline Insights</h2>
        <p>
          Application deadlines from the current dataset, split into upcoming and passed.
          Upcoming programs are sorted soonest first.
        </p>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="card-grid">
        <InfoCard title="Upcoming deadlines">
          <p className="kpi-value">{upcoming.length}</p>
          <p className="muted-text">Programs still open for application.</p>
        </InfoCard>

        <InfoCard title="Passed deadlines">
          <p className="kpi-value">{passed.length}</p>
          <p className="muted-text">Programs whose deadlines have already closed.</p>
        </InfoCard>

        {nextDeadline ? (
          <InfoCard title="Next closing deadline" eyebrow="Soonest upcoming">
            <p>
              <Link className="text-link" to={`/programs/${nextDeadline.program_id}`}>
                <strong>{nextDeadline.major_name}</strong>
              </Link>
            </p>
            <p className="muted-text">{nextDeadline.university_name}</p>
            <p>{nextDeadline.application_deadline} &mdash; {formatDaysLeft(daysUntil(nextDeadline.application_deadline))}</p>
          </InfoCard>
        ) : (
          <InfoCard title="No upcoming deadlines" tone="muted">
            <p className="muted-text">All program deadlines in the current dataset have passed.</p>
          </InfoCard>
        )}
      </div>

      <InfoCard title="Upcoming programs" eyebrow={`${upcoming.length} open`}>
        {upcoming.length ? (
          <div className="table-shell">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>University</th>
                  <th>Country</th>
                  <th>Deadline</th>
                  <th>Days left</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((p) => (
                  <tr key={p.program_id}>
                    <td>
                      <Link className="text-link" to={`/programs/${p.program_id}`}>
                        {p.major_name}
                      </Link>
                    </td>
                    <td>{p.university_name}</td>
                    <td>{COUNTRY_NAMES[p.country_id] ?? p.country_id}</td>
                    <td>{p.application_deadline}</td>
                    <td><strong>{formatDaysLeft(daysUntil(p.application_deadline))}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted-text">No upcoming deadlines in the current dataset.</p>
        )}
      </InfoCard>

      <InfoCard title="Passed deadlines" eyebrow={`${passed.length} closed`} tone="muted">
        {passed.length ? (
          <div className="table-shell">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>University</th>
                  <th>Country</th>
                  <th>Deadline</th>
                  <th>Days since</th>
                </tr>
              </thead>
              <tbody>
                {passed.map((p) => (
                  <tr key={p.program_id}>
                    <td>
                      <Link className="text-link" to={`/programs/${p.program_id}`}>
                        {p.major_name}
                      </Link>
                    </td>
                    <td>{p.university_name}</td>
                    <td>{COUNTRY_NAMES[p.country_id] ?? p.country_id}</td>
                    <td className="deadline-passed">{p.application_deadline}</td>
                    <td className="deadline-passed">{formatDaysSince(daysSince(p.application_deadline))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted-text">No passed deadlines in the current dataset.</p>
        )}
      </InfoCard>
    </div>
  )
}

export default DeadlineInsightsPage
