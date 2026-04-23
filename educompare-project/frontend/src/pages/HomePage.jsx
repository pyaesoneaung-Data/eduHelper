import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBestValuePrograms, getPrograms, getUniversities } from '../api/api'
import { useAppShell } from '../context/AppShellContext'
import { convertCurrency } from '../utils/currency'
import logoIcon from '../assets/logo/logo.svg'
import IconImage from '../components/IconImage'

const COUNTRY_NAMES = {
  C001: 'Taiwan',
  C002: 'Thailand',
  C003: 'Singapore',
}

function formatLeaderboardCost(yearlyValue, nativeCurrency, displayCurrency) {
  if (yearlyValue == null) return 'Not listed'
  const isUSD = displayCurrency === 'USD'
  const amount = isUSD ? convertCurrency(yearlyValue, nativeCurrency, 'USD') : yearlyValue
  const label = isUSD ? 'USD' : nativeCurrency
  return `${Math.round(amount).toLocaleString()} ${label}/yr`
}

// value_score = normalised(low cost) + normalised(low GPA) + normalised(low IELTS), averaged to 0–100
// null GPA / IELTS treated as 0 — no requirement = most accessible
function buildValueLeaderboard(rawPrograms) {
  if (!rawPrograms.length) return []

  const programs = rawPrograms.map((p) => ({
    ...p,
    min_gpa: p.min_gpa ?? 0,
    ielts_min: p.ielts_min ?? 0,
  }))

  // Convert all costs to USD so cross-currency comparison is fair
  const costsUSD = programs.map((p) => convertCurrency(p.yearly_cost, p.currency, 'USD'))
  const gpas = programs.map((p) => p.min_gpa)
  const ieltss = programs.map((p) => p.ielts_min)

  const minCost = Math.min(...costsUSD)
  const maxCost = Math.max(...costsUSD)
  const minGpa = Math.min(...gpas)
  const maxGpa = Math.max(...gpas)
  const minIelts = Math.min(...ieltss)
  const maxIelts = Math.max(...ieltss)

  const scored = programs.map((p, i) => {
    const costScore = maxCost !== minCost ? ((maxCost - costsUSD[i]) / (maxCost - minCost)) * 100 : 100
    const gpaScore = maxGpa !== minGpa ? ((maxGpa - gpas[i]) / (maxGpa - minGpa)) * 100 : 100
    const ieltsScore = maxIelts !== minIelts ? ((maxIelts - ieltss[i]) / (maxIelts - minIelts)) * 100 : 100
    return {
      ...p,
      value_score: Math.round((costScore + gpaScore + ieltsScore) / 3),
    }
  })

  // Per university: keep the program with the highest value score
  const byUniversity = new Map()
  scored.forEach((p) => {
    if (!byUniversity.has(p.university_id) || p.value_score > byUniversity.get(p.university_id).value_score) {
      byUniversity.set(p.university_id, p)
    }
  })

  return [...byUniversity.values()]
    .sort((a, b) => b.value_score - a.value_score)
    .slice(0, 6)
}

const RECENT_SEARCHES_KEY = 'educompare_recent_searches'
const MAX_RECENT = 5

function loadRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? '[]')
  } catch {
    return []
  }
}

function HomePage() {
  const { currency: displayCurrency } = useAppShell()
  const [programs, setPrograms] = useState([])
  const [universities, setUniversities] = useState([])
  const [rawValueData, setRawValueData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [recentSearches, setRecentSearches] = useState(loadRecentSearches)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [programData, universityData, valueData] = await Promise.all([
          getPrograms(),
          getUniversities(),
          getBestValuePrograms(),
        ])
        setPrograms(programData)
        setUniversities(universityData)
        setRawValueData(valueData)
      } catch {
        setError('Program data could not be loaded from the backend.')
      }
    }

    loadData()
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
    if (!searchTerm.trim()) return []

    const normalized = searchTerm.trim().toLowerCase()

    return enrichedPrograms
      .filter((program) => {
        const majorName = program.major_name?.toLowerCase() ?? ''
        const universityName = program.university_name?.toLowerCase() ?? ''
        return majorName.includes(normalized) || universityName.includes(normalized)
      })
      .slice(0, 5)
  }, [enrichedPrograms, searchTerm])

  function saveSearch(term) {
    const trimmed = term.trim()
    if (!trimmed) return

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== trimmed)
      const next = [trimmed, ...filtered].slice(0, MAX_RECENT)
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
      return next
    })
  }

  const countryCounts = useMemo(
    () =>
      enrichedPrograms.reduce((counts, program) => {
        counts[program.country_id] = (counts[program.country_id] ?? 0) + 1
        return counts
      }, {}),
    [enrichedPrograms],
  )

  const valueLeaderboard = useMemo(() => buildValueLeaderboard(rawValueData), [rawValueData])

  return (
    <div className="page-stack">
      <section className="home-trust-strip">
        <p>UniMatch / EduCompare turns current program records into a safer starting point for Thailand, Taiwan, and Singapore decisions.</p>
      </section>

      <section className="home-figma-grid">
        <article className="panel home-welcome-panel">
          <div className="home-welcome-copy">
            <h2>Make an informed decision</h2>
            <p>
              Review verified programs, realistic yearly costs, and legal work rules from one dashboard before trusting any external sales pitch.
            </p>
          </div>

          <div className="home-welcome-side">
            <p className="home-mini-label">Where to start</p>
            <nav className="home-quick-actions">
              <Link className="home-action-link" to="/decision-hub/recommendation">
                <span className="home-action-arrow">→</span> Get a recommendation
              </Link>
              <Link className="home-action-link" to="/decision-hub/compare">
                <span className="home-action-arrow">→</span> Compare programs
              </Link>
              <Link className="home-action-link" to="/decision-hub/cost-calculator">
                <span className="home-action-arrow">→</span> Check costs
              </Link>
            </nav>
          </div>
        </article>

        <section className="panel home-search-panel">
          <div className="panel-heading">
            <h2>University Explorer</h2>
            <p>Search by university name or major to explore programs across Taiwan, Thailand, and Singapore.</p>
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
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          {!searchTerm.trim() ? (
            <>
              {recentSearches.length ? (
                <div className="recent-searches">
                  <p className="home-mini-label">Recent searches</p>
                  <div className="recent-search-chips">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        className="recent-search-chip"
                        onClick={() => setSearchTerm(term)}
                        type="button"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <p className="empty-state">
                {programs.length
                  ? `${programs.length} programs loaded — type a university or major name to search.`
                  : 'Loading program data…'}
              </p>
            </>
          ) : searchResults.length ? (
            <div className="search-results">
              {searchResults.map((program) => (
                <Link
                  key={program.program_id}
                  className="search-result-card"
                  to={`/programs/${program.program_id}`}
                  onClick={() => saveSearch(searchTerm)}
                >
                  <strong>{program.university_name}</strong>
                  <span>{program.major_name}</span>
                  <span>{`${program.degree_level} • ${program.instruction_language} • ${COUNTRY_NAMES[program.country_id] ?? program.country_id}`}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="empty-state">
              No programs match &ldquo;{searchTerm.trim()}&rdquo; — try a different university or major name.
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
              <dd>{countryCounts.C001 ?? 0}</dd>
            </div>
            <div>
              <dt>Thailand records</dt>
              <dd>{countryCounts.C002 ?? 0}</dd>
            </div>
            <div>
              <dt>Singapore records</dt>
              <dd>{countryCounts.C003 ?? 0}</dd>
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
            <h2>Best Value Universities</h2>
            <p>Ranked by cost, GPA, and IELTS accessibility. Lower on all three = higher score.</p>
          </div>

          {valueLeaderboard.length ? (
            <div className="value-leaderboard">
              {valueLeaderboard.map((item, index) => (
                <div key={item.university_id} className="value-leaderboard-row">
                  <span className="value-leaderboard-rank">{index + 1}</span>
                  <div className="value-leaderboard-info">
                    <span className="value-leaderboard-name">{item.university_name}</span>
                    <span className="value-leaderboard-meta">
                      {formatLeaderboardCost(item.yearly_cost, item.currency, displayCurrency)}
                      {' · GPA '}
                      {item.min_gpa === 0 ? '—' : item.min_gpa}
                      {' · IELTS '}
                      {item.ielts_min === 0 ? '—' : item.ielts_min}
                    </span>
                  </div>
                  <span className="value-leaderboard-score">{item.value_score}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">Value ranking will appear after data loads.</p>
          )}
        </aside>
      </section>
    </div>
  )
}

export default HomePage
