import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPrograms, getUniversities } from '../api/api'
import logoIcon from '../assets/logo/logo.svg'
import IconImage from '../components/IconImage'

function buildUniversitySummaries(programs) {
  const grouped = new Map()

  programs.forEach((program) => {
    const key = `${program.university_name ?? 'Unknown university'}::${program.country_id ?? 'Unknown'}`

    if (!grouped.has(key)) {
      grouped.set(key, {
        university_name: program.university_name ?? 'Unknown university',
        country_id: program.country_id ?? 'Not listed',
        program_count: 0,
        first_program_id: program.program_id,
        first_major_name: program.major_name ?? 'Program record',
      })
    }

    grouped.get(key).program_count += 1
  })

  return [...grouped.values()]
    .sort((left, right) => {
      if (left.program_count !== right.program_count) {
        return right.program_count - left.program_count
      }

      return left.university_name.localeCompare(right.university_name)
    })
    .slice(0, 6)
}

function HomePage() {
  const [programs, setPrograms] = useState([])
  const [universities, setUniversities] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPrograms() {
      try {
        const [programData, universityData] = await Promise.all([getPrograms(), getUniversities()])
        setPrograms(programData)
        setUniversities(universityData)
      } catch {
        setError('Program search data could not be loaded from the backend.')
      }
    }

    loadPrograms()
  }, [])

  const universityMap = useMemo(
    () =>
      universities.reduce((map, university) => {
        map[university.university_id] = university
        return map
      }, {}),
    [universities],
  )

  const enrichedPrograms = useMemo(
    () =>
      programs.map((program) => ({
        ...program,
        university_name: universityMap[program.university_id]?.university_name ?? 'Unknown university',
        country_id: universityMap[program.university_id]?.country_id ?? 'Not listed',
      })),
    [programs, universityMap],
  )

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return enrichedPrograms.slice(0, 5)
    }

    const normalized = searchTerm.trim().toLowerCase()

    return enrichedPrograms
      .filter((program) => {
        const majorName = program.major_name?.toLowerCase() ?? ''
        const universityName = program.university_name?.toLowerCase() ?? ''
        return majorName.includes(normalized) || universityName.includes(normalized)
      })
      .slice(0, 5)
  }, [enrichedPrograms, searchTerm])

  const countryCounts = useMemo(
    () =>
      enrichedPrograms.reduce((counts, program) => {
        counts[program.country_id] = (counts[program.country_id] ?? 0) + 1
        return counts
      }, {}),
    [enrichedPrograms],
  )

  const featuredProgram = searchResults[0] ?? enrichedPrograms[0] ?? null
  const universitySummaries = useMemo(() => buildUniversitySummaries(enrichedPrograms), [enrichedPrograms])
  const spotlightUniversities = universitySummaries.slice(0, 3)
  const remainingUniversities = universitySummaries.slice(3)

  return (
    <div className="page-stack">
      <section className="home-trust-strip">
        <p>UniMatch / EduCompare turns current program records into a safer starting point for Thailand and Taiwan decisions.</p>
      </section>

      <section className="home-figma-grid">
        <article className="panel home-welcome-panel">
          <div className="home-welcome-copy">
            <h2>Welcome Back</h2>
            <p>
              Review verified programs, realistic yearly costs, and legal work rules from one dashboard before trusting any external sales pitch.
            </p>
          </div>

          <div className="home-welcome-side">
            <p className="home-mini-label">Featured program</p>
            <strong>{featuredProgram?.university_name ?? 'University explorer is loading'}</strong>
            <p className="muted-text">{featuredProgram?.major_name ?? 'Live records will appear here once the program list loads.'}</p>
            {featuredProgram ? (
              <Link className="secondary-button home-compare-button" to={`/programs/${featuredProgram.program_id}`}>
                View program detail
              </Link>
            ) : null}
          </div>
        </article>

        <section className="panel home-search-panel">
          <div className="panel-heading">
            <h2>University Explorer</h2>
            <p>Search current program records and open detail pages directly. This replaces any fake campus-media block until richer media support exists.</p>
          </div>

          <div className="home-search-bar">
            <div className="home-search-badge">
              <IconImage src={logoIcon} className="home-search-logo" alt="" />
            </div>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search university or major"
              aria-label="Search university or major"
            />
            {featuredProgram ? (
              <Link className="home-search-action" to={`/programs/${featuredProgram.program_id}`}>
                View detail
              </Link>
            ) : (
              <span className="home-search-helper">Loading</span>
            )}
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          {searchResults.length ? (
            <div className="search-results">
              {searchResults.map((program) => (
                <Link key={program.program_id} className="search-result-card" to={`/programs/${program.program_id}`}>
                  <strong>{program.university_name}</strong>
                  <span>{program.major_name}</span>
                  <span>{`${program.degree_level} • ${program.instruction_language} • ${program.country_id}`}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="empty-state">
              No current records match that search. The explorer uses live program data and updates as you type.
            </p>
          )}
        </section>

        <section className="panel home-about-panel">
          <div className="panel-heading">
            <h2>Platform Summary</h2>
            <p>Use the dashboard as a decision workspace, not a marketing page. Each section is tied to current backend data or an honest planned-state note.</p>
          </div>

          <dl className="detail-grid compact">
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

          <ul className="content-list">
            <li>Decision Hub groups recommendation, compare, and cost tools in one workspace.</li>
            <li>Analytics keeps cost and admission summaries inside one section with internal navigation.</li>
            <li>Legal info and red flag guidance stay in the sidebar as persistent destinations.</li>
          </ul>
        </section>

        <aside className="panel home-leaderboard-panel">
          <div className="panel-heading">
            <h2>Leaderboard Area</h2>
            <p>Current cards use dataset visibility only: universities with the most program records in this app. This is not a prestige ranking.</p>
          </div>

          {spotlightUniversities.length === 3 ? (
            <div className="leaderboard-podium">
              <div className="podium-item">
                <div className="podium-circle" />
                <span className="podium-name">{spotlightUniversities[1].university_name}</span>
                <div className="podium-bar podium-bar-second">{spotlightUniversities[1].program_count}</div>
              </div>
              <div className="podium-item">
                <div className="podium-circle podium-circle-main" />
                <span className="podium-name">{spotlightUniversities[0].university_name}</span>
                <div className="podium-bar podium-bar-main">{spotlightUniversities[0].program_count}</div>
              </div>
              <div className="podium-item">
                <div className="podium-circle" />
                <span className="podium-name">{spotlightUniversities[2].university_name}</span>
                <div className="podium-bar podium-bar-third">{spotlightUniversities[2].program_count}</div>
              </div>
            </div>
          ) : (
            <p className="empty-state">University visibility data will appear here after the program list loads.</p>
          )}

          <div className="leaderboard-list">
            {remainingUniversities.length ? (
              remainingUniversities.map((university) => (
                <div key={`${university.university_name}-${university.country_id}`} className="leaderboard-row">
                  <div>
                    <span className="leaderboard-name">{university.university_name}</span>
                    <p className="leaderboard-subtext">{university.first_major_name}</p>
                  </div>
                  <span className="leaderboard-country">{`${university.program_count} programs`}</span>
                </div>
              ))
            ) : (
              <p className="muted-text">Additional university records will appear below the spotlight cards.</p>
            )}
          </div>
        </aside>
      </section>
    </div>
  )
}

export default HomePage
