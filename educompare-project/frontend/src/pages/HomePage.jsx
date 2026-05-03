import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, CalendarDays, Globe2, ShieldCheck } from 'lucide-react'
import { getBestValuePrograms, getPrograms, getUniversities } from '../api/api'
import { useAppShell } from '../context/AppShellContext'
import { convertCurrency } from '../utils/currency'
import logoLight from '../assets/logo/logo_light_without_text.svg'
import logoDark from '../assets/logo/logo_dark_without_text.svg'
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

function HomeKpiCard({ icon: Icon, title, value, subtitle, accentClass }) {
  return (
    <article className="home-kpi-card">
      <div className={`home-kpi-icon ${accentClass}`}>
        <Icon size={18} strokeWidth={2} aria-hidden="true" />
      </div>
      <div className="home-kpi-copy">
        <span className="home-kpi-title">{title}</span>
        <strong className="home-kpi-value">{value}</strong>
        <span className="home-kpi-subtitle">{subtitle}</span>
      </div>
    </article>
  )
}

function HomePage() {
  const { currency: displayCurrency, theme } = useAppShell()
  const logoSrc = theme === 'dark' ? logoDark : logoLight
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
  const totalPrograms = programs.length || 15

  return (
    <div className="page-stack">
      <section className="home-trust-strip">
        <p>UniMatch / EduCompare turns current program records into a safer starting point for Thailand, Taiwan, and Singapore decisions.</p>
      </section>

      <section className="home-kpi-row" aria-label="Home summary metrics">
        <HomeKpiCard
          icon={Building2}
          title="Programs in database"
          value={totalPrograms}
          subtitle="Across 3 countries"
          accentClass="home-kpi-icon-programs"
        />
        <HomeKpiCard
          icon={ShieldCheck}
          title="Verified records"
          value="100%"
          subtitle="Updated from source data"
          accentClass="home-kpi-icon-verified"
        />
        <HomeKpiCard
          icon={Globe2}
          title="Countries covered"
          value="3"
          subtitle="Taiwan, Thailand, Singapore"
          accentClass="home-kpi-icon-countries"
        />
        <HomeKpiCard
          icon={CalendarDays}
          title="Last data refresh"
          value="3/May/2026"
          subtitle="Up to date"
          accentClass="home-kpi-icon-refresh"
        />
      </section>

      <section className="home-figma-grid">
        <section className="panel home-search-panel">
          <div className="panel-heading">
            <h2>University Explorer</h2>
            <p>Search by university name or major across Taiwan, Thailand, and Singapore.</p>
          </div>

          <div className="home-search-bar">
            <div className="home-search-badge">
              <IconImage src={logoSrc} className="home-search-logo" alt="" />
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
              <p className="muted-text">
                {programs.length
                  ? `${programs.length} programs loaded — type a university or major to search.`
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

        <section className="panel home-actions-panel">
          <div className="panel-heading">
            <h2>Where to start</h2>
            <p>Not sure which university fits? Let the tools guide you.</p>
          </div>

          <nav className="home-action-cards">
            <Link className="home-action-card" to="/decision-hub/recommendation">
              <span className="home-action-card-title">Get a recommendation</span>
              <span className="home-action-card-desc">Answer a few questions and get matched to programs that fit your budget and grades.</span>
            </Link>
            <Link className="home-action-card" to="/decision-hub/compare">
              <span className="home-action-card-title">Compare programs</span>
              <span className="home-action-card-desc">Side-by-side view of costs, entry requirements, and language of instruction.</span>
            </Link>
            <Link className="home-action-card" to="/decision-hub/cost-calculator">
              <span className="home-action-card-title">Check costs</span>
              <span className="home-action-card-desc">Calculate realistic yearly expenses including tuition, living, and insurance.</span>
            </Link>
          </nav>
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

        <section className="panel home-snapshot-panel">
          <div className="panel-heading">
            <h2>What's in the database</h2>
            <p>Verified program records across three countries — updated directly from source data.</p>
          </div>

          <div className="home-country-grid">
            <div className="home-country-card">
              <span className="home-country-name">Taiwan</span>
              <span className="home-country-count">{countryCounts.C001 ?? 0}</span>
              <span className="home-country-label">programs</span>
            </div>
            <div className="home-country-card">
              <span className="home-country-name">Thailand</span>
              <span className="home-country-count">{countryCounts.C002 ?? 0}</span>
              <span className="home-country-label">programs</span>
            </div>
            <div className="home-country-card">
              <span className="home-country-name">Singapore</span>
              <span className="home-country-count">{countryCounts.C003 ?? 0}</span>
              <span className="home-country-label">programs</span>
            </div>
          </div>
        </section>
      </section>
    </div>
  )
}

export default HomePage
