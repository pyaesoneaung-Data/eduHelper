import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Buildings, Coins, GlobeSimple, GraduationCap, MagnifyingGlass } from '@phosphor-icons/react'
import { getBestValuePrograms, getPrograms, getUniversities } from '../api/api'
import { useAppShell } from '../context/AppShellContext'
import { convertCurrency } from '../utils/currency'

const COUNTRY_NAMES = {
  C001: 'Taiwan',
  C002: 'Thailand',
  C003: 'Singapore',
}

function formatDeadlineRelative(dateStr) {
  const deadline = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((deadline - today) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays > 0 && diffDays <= 60) return `${diffDays}d`
  if (diffDays > 60) return deadline.toLocaleDateString('en', { month: 'short', day: 'numeric' })
  if (diffDays >= -14) return `${Math.abs(diffDays)}d ago`
  return deadline.toLocaleDateString('en', { month: 'short', day: 'numeric' })
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
    .slice(0, 5)
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
        <Icon size={28} weight="duotone" aria-hidden="true" />
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
  const { currency: displayCurrency, t } = useAppShell()
  const [programs, setPrograms] = useState([])
  const [universities, setUniversities] = useState([])
  const [rawValueData, setRawValueData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [recentSearches, setRecentSearches] = useState(loadRecentSearches)
  const [error, setError] = useState('')
  const searchRef = useRef(null)

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
      } finally {
        setIsLoading(false)
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

  // Close dropdown when clicking outside the search container
  useEffect(() => {
    function handleOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchTerm('')
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

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


  const valueLeaderboard = useMemo(() => buildValueLeaderboard(rawValueData), [rawValueData])

  const upcomingDeadlines = useMemo(() => {
    if (!enrichedPrograms.length) return []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const withDate = enrichedPrograms.filter((p) => p.application_deadline)
    const future = withDate
      .filter((p) => new Date(p.application_deadline + 'T00:00:00') >= today)
      .sort((a, b) => new Date(a.application_deadline) - new Date(b.application_deadline))
    const past = withDate
      .filter((p) => new Date(p.application_deadline + 'T00:00:00') < today)
      .sort((a, b) => new Date(b.application_deadline) - new Date(a.application_deadline))
    return [...future, ...past].slice(0, 3)
  }, [enrichedPrograms])


  // Find the lowest-cost program using rawValueData — the only source with yearly_cost + currency.
  // /programs endpoint has no cost fields; /analytics/best-value-programs does.
  const minCostDisplay = useMemo(() => {
    if (!rawValueData.length) return '—'
    let lowestUSD = Infinity
    let cheapestProgram = null
    rawValueData.forEach((p) => {
      if (p.yearly_cost == null || !p.currency) return
      const usd = convertCurrency(p.yearly_cost, p.currency, 'USD')
      if (usd != null && !isNaN(usd) && usd < lowestUSD) {
        lowestUSD = usd
        cheapestProgram = p
      }
    })
    if (!cheapestProgram) return '—'
    const isUSD = displayCurrency === 'USD'
    const rawAmount = isUSD
      ? convertCurrency(cheapestProgram.yearly_cost, cheapestProgram.currency, 'USD')
      : cheapestProgram.yearly_cost
    if (rawAmount == null || isNaN(rawAmount)) return '—'
    const label = isUSD ? 'USD' : cheapestProgram.currency
    return `${Math.round(rawAmount).toLocaleString()} ${label}`
  }, [rawValueData, displayCurrency])

  return (
    <div className="page-stack home-page">
      <section className="home-kpi-row" aria-label="Home summary metrics">
        <HomeKpiCard
          icon={Buildings}
          title={t('home.kpiPrograms', 'Programs')}
          value={isLoading ? '—' : programs.length}
          subtitle={t('home.acrossCountries', 'Across 3 countries')}
          accentClass="home-kpi-icon-programs"
        />
        <HomeKpiCard
          icon={GraduationCap}
          title={t('home.kpiUniversities', 'Universities')}
          value={isLoading ? '—' : universities.length}
          subtitle={t('home.inDatabase', 'In our database')}
          accentClass="home-kpi-icon-verified"
        />
        <HomeKpiCard
          icon={GlobeSimple}
          title={t('home.kpiCountries', 'Countries')}
          value="3"
          subtitle="Taiwan · Thailand · Singapore"
          accentClass="home-kpi-icon-countries"
        />
        <HomeKpiCard
          icon={Coins}
          title={t('home.kpiStartingFrom', 'Starting from')}
          value={isLoading ? '—' : minCostDisplay}
          subtitle={t('home.lowestCost', 'Lowest yearly program cost')}
          accentClass="home-kpi-icon-refresh"
        />
      </section>

      <section className="home-figma-grid">
        <section className="panel home-search-panel">
          <div className="panel-heading">
            <h2>{t('home.findUniversity', 'Find a university')}</h2>
            <p>{t('home.findUniversityDesc', 'Search by university or program.')}</p>
          </div>

          {/* Search bar + dropdown — results float as overlay, never push panel height */}
          <div className="home-search-container" ref={searchRef}>
            <div className="home-search-bar">
              <MagnifyingGlass className="home-search-icon" size={18} weight="regular" aria-hidden="true" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setSearchTerm('')}
                placeholder={t('home.searchPlaceholder', 'Search university or program')}
                aria-label={t('home.searchPlaceholder', 'Search university or program')}
              />
            </div>

            {searchTerm.trim() ? (
              <div className="home-search-dropdown" role="listbox" aria-label="Search results">
                {searchResults.length ? (
                  searchResults.map((program) => (
                    <Link
                      key={program.program_id}
                      className="home-search-result"
                      to={`/programs/${program.program_id}`}
                      onClick={() => { saveSearch(searchTerm); setSearchTerm('') }}
                      role="option"
                    >
                      <span className="home-search-result-name">{program.university_name}</span>
                      <span className="home-search-result-meta">
                        {program.major_name} · {program.degree_level} · {COUNTRY_NAMES[program.country_id] ?? program.country_id}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="home-search-empty">No results for &ldquo;{searchTerm.trim()}&rdquo;</p>
                )}
              </div>
            ) : null}
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          {/* Static content — always visible, never changes when typing */}
          {recentSearches.length ? (
            <div className="recent-searches">
              <p className="home-mini-label">{t('home.recentSearches', 'Recent searches')}</p>
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
              ? `${programs.length} ${t('home.programs', 'programs')} — ${t('home.typeToSearch', 'type to search.')}`
              : t('home.loading', 'Loading…')}
          </p>
        </section>

        <section className="panel home-actions-panel">
          <div className="panel-heading">
            <h2>{t('home.whereToStart', 'Where to start')}</h2>
            <p>{t('home.whereToStartDesc', 'Pick a tool to get started.')}</p>
          </div>

          <nav className="home-action-cards">
            <Link className="home-action-card" to="/decision-hub/recommendation">
              <span className="home-action-card-title">{t('home.getRecommendation', 'Get a recommendation')}</span>
              <span className="home-action-card-desc">{t('home.getRecommendationDesc', 'Answer a few questions, get matched.')}</span>
            </Link>
            <Link className="home-action-card" to="/decision-hub/compare">
              <span className="home-action-card-title">{t('home.comparePrograms', 'Compare programs')}</span>
              <span className="home-action-card-desc">{t('home.compareProgramsDesc', 'Side-by-side costs and requirements.')}</span>
            </Link>
            <Link className="home-action-card" to="/decision-hub/cost-calculator">
              <span className="home-action-card-title">{t('home.checkCosts', 'Check costs')}</span>
              <span className="home-action-card-desc">{t('home.checkCostsDesc', 'Estimate tuition, living, insurance.')}</span>
            </Link>
          </nav>
        </section>

        <aside className="panel home-leaderboard-panel">
          <div className="panel-heading">
            <h2>{t('home.bestValue', 'Best Value Universities')}</h2>
            <p>{t('home.bestValueDesc', 'Lower cost · GPA · IELTS = higher score.')}</p>
          </div>

          {valueLeaderboard.length ? (
            <div className="value-leaderboard">
              {valueLeaderboard.map((item, index) => {
                const website = universityMap[item.university_id]?.official_website
                return website ? (
                  <a
                    key={item.university_id}
                    className="value-leaderboard-row"
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                  >
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
                  </a>
                ) : (
                  <Link
                    key={item.university_id}
                    className="value-leaderboard-row"
                    to={`/programs/${item.program_id}`}
                  >
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
                  </Link>
                )
              })}
            </div>
          ) : (
            <p className="empty-state">Value ranking will appear after data loads.</p>
          )}
        </aside>

        {/* Row 2 — Deadlines */}
        <section className="panel home-deadlines-panel">
          <div className="panel-heading">
            <h2>{t('home.deadlines', 'Deadlines')}</h2>
            <p>{t('home.deadlinesDesc', 'Application windows, closest first.')}</p>
          </div>
          {upcomingDeadlines.length ? (
            <div className="home-deadline-list">
              {upcomingDeadlines.map((p) => {
                const isPast = new Date(p.application_deadline + 'T00:00:00') < new Date()
                return (
                  <Link key={p.program_id} className="home-deadline-row" to={`/programs/${p.program_id}`}>
                    <div className="home-deadline-info">
                      <span className="home-deadline-name">{p.major_name}</span>
                      <span className="home-deadline-uni">{p.university_name}</span>
                    </div>
                    <span className={`home-deadline-badge ${isPast ? 'home-deadline-badge-past' : 'home-deadline-badge-upcoming'}`}>
                      {formatDeadlineRelative(p.application_deadline)}
                    </span>
                  </Link>
                )
              })}
            </div>
          ) : (
            <p className="empty-state">Deadline data loading…</p>
          )}
        </section>


      </section>
    </div>
  )
}

export default HomePage
