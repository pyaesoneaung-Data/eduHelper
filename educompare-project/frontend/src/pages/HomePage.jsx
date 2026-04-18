import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPrograms } from '../api/api'
import InfoCard from '../components/InfoCard'
import PageHeader from '../components/PageHeader'

function HomePage() {
  const [programs, setPrograms] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPrograms() {
      try {
        const data = await getPrograms()
        setPrograms(data)
      } catch {
        setError('Program search data could not be loaded from the backend.')
      }
    }

    loadPrograms()
  }, [])

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return programs.slice(0, 6)
    }

    const normalized = searchTerm.trim().toLowerCase()

    return programs
      .filter((program) => {
        const majorName = program.major_name?.toLowerCase() ?? ''
        const universityName = program.university_name?.toLowerCase() ?? ''
        return majorName.includes(normalized) || universityName.includes(normalized)
      })
      .slice(0, 6)
  }, [programs, searchTerm])

  const countryCounts = useMemo(
    () =>
      programs.reduce((counts, program) => {
        counts[program.country_id] = (counts[program.country_id] ?? 0) + 1
        return counts
      }, {}),
    [programs],
  )

  const leaderboardRows = useMemo(() => programs.slice(0, 5), [programs])

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Home"
        title="A serious student decision dashboard built to replace agent-driven guesswork."
        description="UniMatch / EduCompare helps students compare programs with verified costs, clearer admission requirements, and legal guardrails before making a study-abroad decision."
      >
        <div className="action-row">
          <Link className="primary-button" to="/decision-hub/recommendation">
            Open Decision Hub
          </Link>
          <Link className="secondary-button" to="/analytics">
            Review analytics
          </Link>
        </div>
      </PageHeader>

      <div className="home-grid home-grid-intro">
        <InfoCard title="Trust-first product statement" eyebrow="Why this product exists">
          <p>
            Students should be able to review tuition, living costs, deadlines, and legal work
            rules from structured records instead of marketing claims.
          </p>
        </InfoCard>
        <InfoCard title="Current dataset coverage" eyebrow="Live summary">
          <dl className="detail-grid">
            <div>
              <dt>Programs loaded</dt>
              <dd>{programs.length}</dd>
            </div>
            <div>
              <dt>Taiwan records</dt>
              <dd>{countryCounts.C001 ?? countryCounts.TW ?? 0}</dd>
            </div>
            <div>
              <dt>Thailand records</dt>
              <dd>{countryCounts.C002 ?? countryCounts.TH ?? 0}</dd>
            </div>
          </dl>
        </InfoCard>
      </div>

      <div className="home-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>Find university or program</h2>
            <p>Use live program data to quickly inspect universities and jump into program detail pages.</p>
          </div>

          <label>
            Search
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by university or major name"
            />
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <div className="search-results">
            {searchResults.length ? (
              searchResults.map((program) => (
                <Link key={program.program_id} className="search-result-card" to={`/programs/${program.program_id}`}>
                  <strong>{program.university_name}</strong>
                  <span>{program.major_name}</span>
                  <span className="muted-text">{`${program.degree_level} • ${program.instruction_language}`}</span>
                </Link>
              ))
            ) : (
              <p className="empty-state">No matching programs were found in the current dataset.</p>
            )}
          </div>
        </section>

        <InfoCard title="About this dashboard" eyebrow="Product summary">
          <ul className="content-list">
            <li>Decision Hub keeps recommendation, compare, and cost tools in one working area.</li>
            <li>Analytics compares Taiwan and Thailand with backend-provided summaries.</li>
            <li>Legal and red-flag sections stay visible so risks are part of the decision flow.</li>
          </ul>
        </InfoCard>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <h2>Top university summary panel</h2>
          <p>This panel is a placeholder layout block using live program rows until a standardized leaderboard rule is defined.</p>
        </div>

        <div className="table-shell">
          <table className="compare-table">
            <thead>
              <tr>
                <th>University</th>
                <th>Program</th>
                <th>Country</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardRows.map((program) => (
                <tr key={program.program_id}>
                  <td>{program.university_name}</td>
                  <td>{program.major_name}</td>
                  <td>{program.country_id}</td>
                  <td>Placeholder ranking summary</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default HomePage
