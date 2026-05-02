import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCostOverviewAnalytics, getCountryRules } from '../api/api'
import { useAppShell } from '../context/AppShellContext'
import InfoCard from '../components/InfoCard'
import {
  convertCurrency,
  formatDisplayCost,
  FROM_USD,
  EXCHANGE_RATE_DATE,
} from '../utils/currency'

// ─── Constants ────────────────────────────────────────────────────────────────

const COUNTRY_ORDER = ['taiwan', 'thailand', 'singapore']

// localStorage key — matches the pattern used in AppShellContext
const COUNTRY_FILTER_KEY = 'unimatch-cost-filter'

const COUNTRY_LABEL = {
  taiwan: 'Taiwan',
  thailand: 'Thailand',
  singapore: 'Singapore',
}

// Static part-time monthly reference income (statutory minimum wage × legal hour limit)
// Source: Taiwan MOL, Thailand MOL, Singapore MOM — verified April 2026
// These are REFERENCE figures only. Actual earnings vary.
const PART_TIME_REFERENCE = {
  taiwan: {
    amount: 15840,
    currency: 'TWD',
    basis: 'NT$183/hr × 20 hrs/wk',
  },
  thailand: {
    amount: 10400,
    currency: 'THB',
    basis: 'THB 400/day × 26 days/mo',
  },
  singapore: {
    amount: 780,
    currency: 'SGD',
    basis: 'SGD 9.75/hr × 16 hrs/wk',
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDisplay(amount, nativeCurrency, displayCurrency) {
  if (amount === null || amount === undefined) return null
  return displayCurrency === 'USD'
    ? convertCurrency(Number(amount), nativeCurrency, 'USD')
    : Number(amount)
}

function displayCurrencyFor(nativeCurrency, displayCurrency) {
  return displayCurrency === 'USD' ? 'USD' : nativeCurrency
}

// ─── Exchange rate card ───────────────────────────────────────────────────────

function ExchangeRateCard({ displayCurrency }) {
  if (displayCurrency !== 'USD') return null

  return (
    <InfoCard
      title="USD Reference Rates"
      eyebrow={`As of ${EXCHANGE_RATE_DATE} · Source: XE.com`}
    >
      <div className="exchange-rate-grid">
        <div className="exchange-rate-pair">
          <span className="exchange-rate-value">1 USD</span>
          <span className="exchange-rate-arrow">→</span>
          <span className="exchange-rate-value">{FROM_USD.TWD.toFixed(4)} TWD</span>
        </div>
        <div className="exchange-rate-pair">
          <span className="exchange-rate-value">1 USD</span>
          <span className="exchange-rate-arrow">→</span>
          <span className="exchange-rate-value">{FROM_USD.THB.toFixed(4)} THB</span>
        </div>
        <div className="exchange-rate-pair">
          <span className="exchange-rate-value">1 USD</span>
          <span className="exchange-rate-arrow">→</span>
          <span className="exchange-rate-value">{FROM_USD.SGD.toFixed(4)} SGD</span>
        </div>
      </div>
      <p className="muted-text" style={{ marginTop: '10px' }}>
        All costs on this page are converted to USD using these rates. Verify current rates at{' '}
        <a className="text-link" href="https://www.xe.com" target="_blank" rel="noreferrer">
          XE.com
        </a>{' '}
        before making financial decisions.
      </p>
    </InfoCard>
  )
}

// ─── Country filter pills ─────────────────────────────────────────────────────

function CountryFilterBar({ selected, onToggle }) {
  return (
    <div className="country-filter-bar">
      {COUNTRY_ORDER.map((key) => {
        const isActive = selected.includes(key)
        return (
          <button
            key={key}
            type="button"
            className={`country-pill${isActive ? ' country-pill-active' : ''}`}
            onClick={() => onToggle(key)}
            aria-pressed={isActive}
          >
            {COUNTRY_LABEL[key]}
          </button>
        )
      })}
    </div>
  )
}

// ─── KPI cards ────────────────────────────────────────────────────────────────

function KpiCards({ selectedCountries, countryData, displayCurrency }) {
  return (
    <div className="card-grid">
      {selectedCountries.map((key) => {
        const entry = countryData[key]
        if (!entry) return null
        const native = entry.currency
        const curr = displayCurrencyFor(native, displayCurrency)
        const yearlyCost = toDisplay(entry.average_yearly_cost, native, displayCurrency)
        const yearlyTuition = toDisplay(entry.average_yearly_tuition, native, displayCurrency)
        const monthlyLiving = toDisplay(entry.average_monthly_living_cost, native, displayCurrency)
        // Monthly commitment = tuition spread over 12 months + monthly living
        // This is the number students discuss with their families
        const monthlyCommitment =
          yearlyTuition !== null && monthlyLiving !== null
            ? yearlyTuition / 12 + monthlyLiving
            : yearlyTuition !== null
              ? yearlyTuition / 12
              : monthlyLiving

        return (
          <InfoCard key={key} title={COUNTRY_LABEL[key]} eyebrow="Country Averages">
            <div className="kpi-metric-list">
              <div className="kpi-metric-row">
                <span className="kpi-metric-label">Yearly cost</span>
                <span className="kpi-metric-value">
                  {formatDisplayCost(yearlyCost, curr, curr)}
                </span>
              </div>
              <div className="kpi-metric-row">
                <span className="kpi-metric-label">Yearly tuition</span>
                <span className="kpi-metric-value">
                  {formatDisplayCost(yearlyTuition, curr, curr)}
                </span>
              </div>
              <div className="kpi-metric-row">
                <span className="kpi-metric-label">Monthly living</span>
                <span className="kpi-metric-value">
                  {formatDisplayCost(monthlyLiving, curr, curr)}
                </span>
              </div>
              <div className="kpi-metric-row">
                <span className="kpi-metric-label">Monthly commitment</span>
                <span className="kpi-metric-value">
                  {formatDisplayCost(monthlyCommitment, curr, curr)}
                </span>
              </div>
            </div>
          </InfoCard>
        )
      })}
    </div>
  )
}

// ─── Viz 1: Stacked cost breakdown bar ───────────────────────────────────────

function StackedCostBar({ selectedCountries, countryData, displayCurrency }) {
  const isUSD = displayCurrency === 'USD'

  const rows = selectedCountries
    .map((key) => {
      const entry = countryData[key]
      if (!entry) return null
      const native = entry.currency
      const curr = displayCurrencyFor(native, displayCurrency)
      const tuitionDisplay = toDisplay(entry.average_yearly_tuition, native, displayCurrency) ?? 0
      const livingDisplay = toDisplay(entry.average_monthly_living_cost, native, displayCurrency)
      const livingYearlyDisplay = livingDisplay !== null ? livingDisplay * 12 : 0
      const totalDisplay = tuitionDisplay + livingYearlyDisplay
      // Always use USD for bar width proportions — prevents raw TWD vs THB vs SGD comparisons
      const tuitionUSD = convertCurrency(entry.average_yearly_tuition, native, 'USD') ?? 0
      const livingMonthlyUSD = convertCurrency(entry.average_monthly_living_cost, native, 'USD') ?? 0
      const totalUSD = tuitionUSD + (livingMonthlyUSD * 12)
      return { key, curr, tuitionDisplay, livingYearlyDisplay, totalDisplay, totalUSD }
    })
    .filter(Boolean)

  const maxTotalUSD = Math.max(...rows.map((r) => r.totalUSD), 0)

  return (
    <InfoCard title="Annual Cost Breakdown">
      <p className="muted-text" style={{ marginBottom: '18px' }}>
        {isUSD
          ? 'Bar widths show total yearly cost in USD — directly comparable across countries.'
          : 'Values shown in local currencies. Bar widths use USD proportions for a fair cross-country comparison.'}
      </p>

      <div className="stacked-bar-legend">
        <span className="stacked-legend-item stacked-legend-tuition">Tuition</span>
        <span className="stacked-legend-item stacked-legend-living">Living (×12 months)</span>
      </div>

      <div className="stacked-bar-section">
        {rows.map(({ key, curr, tuitionDisplay, livingYearlyDisplay, totalDisplay, totalUSD }) => {
          const outerWidth = maxTotalUSD > 0 ? (totalUSD / maxTotalUSD) * 100 : 0
          const tuitionPct = totalDisplay > 0 ? (tuitionDisplay / totalDisplay) * 100 : 0
          const livingPct = 100 - tuitionPct

          return (
            <div key={key} className="stacked-bar-row">
              <div className="stacked-bar-meta">
                <span className="stacked-bar-country">{COUNTRY_LABEL[key]}</span>
                <span className="stacked-bar-total">
                  {Math.round(totalDisplay).toLocaleString()} {curr} / yr
                </span>
              </div>
              <div className="stacked-bar-track">
                <div className="stacked-bar-outer" style={{ width: `${outerWidth}%` }}>
                  <div
                    className="stacked-fill-tuition"
                    style={{ width: `${tuitionPct}%` }}
                    title={`Tuition: ${Math.round(tuitionDisplay).toLocaleString()} ${curr}`}
                  />
                  <div
                    className="stacked-fill-living"
                    style={{ width: `${livingPct}%` }}
                    title={`Living (yearly): ${Math.round(livingYearlyDisplay).toLocaleString()} ${curr}`}
                  />
                </div>
              </div>
              <div className="stacked-bar-breakdown">
                <span>Tuition: {Math.round(tuitionDisplay).toLocaleString()} {curr} ({Math.round(tuitionPct)}%)</span>
                <span>Living: {Math.round(livingYearlyDisplay).toLocaleString()} {curr} ({Math.round(livingPct)}%)</span>
              </div>
            </div>
          )
        })}
      </div>

      <p className="muted-text" style={{ marginTop: '14px', fontSize: '0.78rem' }}>
        Living cost = monthly average × 12. Excludes application and insurance fees.
      </p>
    </InfoCard>
  )
}

// ─── Viz 2: Monthly reality check ────────────────────────────────────────────

function MonthlyRealityCheck({ selectedCountries, countryData, rulesMap, displayCurrency }) {
  const isUSD = displayCurrency === 'USD'

  const rows = selectedCountries
    .map((key) => {
      const entry = countryData[key]
      if (!entry) return null
      const native = entry.currency
      const rule = rulesMap[key]
      const partTimeAllowed = rule?.part_time_allowed ?? null
      const workHourLimit = rule?.work_hour_limit ?? null
      const ref = PART_TIME_REFERENCE[key]

      const monthlyLivingNative = entry.average_monthly_living_cost
      const monthlyLivingDisplay =
        toDisplay(monthlyLivingNative, native, displayCurrency) ?? 0
      const curr = displayCurrencyFor(native, displayCurrency)

      let partTimeDisplay = null
      let coveragePct = 0
      let gapDisplay = null
      let surplusDisplay = null

      if (partTimeAllowed && ref) {
        const partTimeNative = ref.amount
        partTimeDisplay = isUSD
          ? convertCurrency(partTimeNative, ref.currency, 'USD')
          : partTimeNative
        coveragePct = monthlyLivingDisplay > 0
          ? Math.min((partTimeDisplay / monthlyLivingDisplay) * 100, 100)
          : 0
        const rawGap = monthlyLivingDisplay - partTimeDisplay
        gapDisplay = Math.max(rawGap, 0)
        surplusDisplay = Math.max(-rawGap, 0)
      }

      return {
        key,
        curr,
        monthlyLivingDisplay,
        partTimeAllowed,
        workHourLimit,
        partTimeDisplay,
        coveragePct,
        gapDisplay,
        surplusDisplay,
      }
    })
    .filter(Boolean)

  return (
    <InfoCard
      title="Monthly Reality Check"
      eyebrow="Part-Time Work vs Monthly Living Costs"
    >
      <div className="reality-check-list">
        {rows.map(
          ({
            key,
            curr,
            monthlyLivingDisplay,
            partTimeAllowed,
            workHourLimit,
            partTimeDisplay,
            coveragePct,
            gapDisplay,
            surplusDisplay,
          }) => (
            <div key={key} className="reality-row">
              <div className="reality-row-head">
                <strong>{COUNTRY_LABEL[key]}</strong>
                {partTimeAllowed && workHourLimit ? (
                  <span className="muted-text" style={{ fontSize: '0.8rem' }}>
                    max {workHourLimit} hrs/wk
                  </span>
                ) : null}
                {partTimeAllowed === false ? (
                  <span className="reality-not-permitted">Part-time not permitted</span>
                ) : null}
              </div>

              <div className="reality-stats">
                <div className="reality-stat">
                  <span className="reality-stat-label">Monthly living</span>
                  <span className="reality-stat-value">
                    {Math.round(monthlyLivingDisplay).toLocaleString()} {curr}
                  </span>
                </div>
                {partTimeAllowed && partTimeDisplay !== null ? (
                  <div className="reality-stat">
                    <span className="reality-stat-label">Part-time income</span>
                    <span className="reality-stat-value">
                      ~{Math.round(partTimeDisplay).toLocaleString()} {curr}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="reality-track-shell">
                <div
                  className="reality-fill"
                  style={{ width: partTimeAllowed ? `${coveragePct}%` : '0%' }}
                />
              </div>

              {partTimeAllowed && partTimeDisplay !== null ? (
                <div className="reality-verdict-block">
                  <p
                    className="reality-verdict"
                    style={{ color: gapDisplay > 0 ? 'var(--muted)' : 'var(--accent)' }}
                  >
                    {gapDisplay > 0
                      ? `${Math.round(coveragePct)}% covered — ~${Math.round(gapDisplay).toLocaleString()} ${curr}/month still needed`
                      : surplusDisplay > 0
                        ? `Fully covered — ~${Math.round(surplusDisplay).toLocaleString()} ${curr}/month left over`
                        : 'Fully covered'}
                  </p>
                  {(gapDisplay > 0 || surplusDisplay > 0) ? (
                    <p className="reality-verdict-annual">
                      {gapDisplay > 0
                        ? `~${Math.round(gapDisplay * 12).toLocaleString()} ${curr}/year from savings or family`
                        : `~${Math.round(surplusDisplay * 12).toLocaleString()} ${curr}/year surplus`}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {partTimeAllowed === false ? (
                <div className="reality-verdict-block">
                  <p className="reality-verdict" style={{ color: 'var(--muted)' }}>
                    ~{Math.round(monthlyLivingDisplay).toLocaleString()} {curr}/month from savings or family
                  </p>
                  <p className="reality-verdict-annual">
                    ~{Math.round(monthlyLivingDisplay * 12).toLocaleString()} {curr}/year total
                  </p>
                </div>
              ) : null}
            </div>
          ),
        )}
      </div>

      <p className="muted-text" style={{ marginTop: '16px', fontSize: '0.78rem' }}>
        Income estimates use minimum wage × legal hour limit as a reference. Actual earnings vary.
        Check official government sources before making plans.
      </p>
    </InfoCard>
  )
}

// ─── Auto-generated insights ──────────────────────────────────────────────────

function generateInsights(selectedCountries, countryData, rulesMap, displayCurrency) {
  const insights = []

  const rows = selectedCountries
    .map((key) => {
      const entry = countryData[key]
      if (!entry) return null
      const native = entry.currency
      // Always compare in USD — prevents nonsensical TWD vs THB vs SGD comparisons in native mode
      const yearlyCostUSD = convertCurrency(entry.average_yearly_cost, native, 'USD') ?? 0
      const yearlyTuitionUSD = convertCurrency(entry.average_yearly_tuition, native, 'USD') ?? 0
      // Display values use the user's chosen currency
      const yearlyCostDisplay = toDisplay(entry.average_yearly_cost, native, displayCurrency) ?? 0
      const yearlyTuitionDisplay = toDisplay(entry.average_yearly_tuition, native, displayCurrency) ?? 0
      const curr = displayCurrencyFor(native, displayCurrency)
      return { key, yearlyCostUSD, yearlyTuitionUSD, yearlyCostDisplay, yearlyTuitionDisplay, curr }
    })
    .filter(Boolean)

  if (rows.length < 2) return insights

  // 1. Cheapest overall — sorted by USD so comparison is always valid
  const sorted = [...rows].sort((a, b) => a.yearlyCostUSD - b.yearlyCostUSD)
  const cheapest = sorted[0]
  const priciest = sorted[sorted.length - 1]
  insights.push(
    `${COUNTRY_LABEL[cheapest.key]} has the lowest estimated yearly cost among selected countries (${Math.round(cheapest.yearlyCostDisplay).toLocaleString()} ${cheapest.curr}).`,
  )

  // 2. Cost ratio if meaningful — always USD-based
  if (priciest.yearlyCostUSD > 0 && cheapest.yearlyCostUSD > 0) {
    const ratio = priciest.yearlyCostUSD / cheapest.yearlyCostUSD
    if (ratio >= 1.3) {
      insights.push(
        `${COUNTRY_LABEL[priciest.key]} costs approximately ${ratio.toFixed(1)}× more per year than ${COUNTRY_LABEL[cheapest.key]}.`,
      )
    }
  }

  // 3. Part-time offset — find best coverage
  const coverageRows = selectedCountries
    .map((key) => {
      const entry = countryData[key]
      if (!entry) return null
      const rule = rulesMap[key]
      if (!rule?.part_time_allowed) return null
      const ref = PART_TIME_REFERENCE[key]
      if (!ref) return null
      const native = entry.currency
      const monthlyLiving = toDisplay(entry.average_monthly_living_cost, native, displayCurrency) ?? 0
      const partTimeDisplay =
        displayCurrency === 'USD'
          ? convertCurrency(ref.amount, ref.currency, 'USD')
          : ref.amount
      const pct = monthlyLiving > 0 ? (partTimeDisplay / monthlyLiving) * 100 : 0
      return { key, pct }
    })
    .filter(Boolean)

  if (coverageRows.length > 0) {
    const best = coverageRows.sort((a, b) => b.pct - a.pct)[0]
    const qualifier =
      best.pct >= 100
        ? 'potentially covering expenses fully'
        : coverageRows.length > 1
          ? 'the highest among selected countries'
          : ''
    const suffix = qualifier ? ` — ${qualifier}` : ''
    insights.push(
      `Part-time work in ${COUNTRY_LABEL[best.key]} can offset approximately ${Math.round(best.pct)}% of average monthly living costs${suffix}.`,
    )
  }

  const nonPermitted = selectedCountries.filter((k) => rulesMap[k]?.part_time_allowed === false)
  if (nonPermitted.length > 0) {
    insights.push(
      `${nonPermitted.map((k) => COUNTRY_LABEL[k]).join(', ')} ${nonPermitted.length > 1 ? 'do' : 'does'} not permit part-time work for student visa holders — budget must rely fully on savings or family support.`,
    )
  }

  // 4. Tuition composition — which country has highest tuition share (USD-based ratio)
  const compositionRows = rows.map(({ key, yearlyCostUSD, yearlyTuitionUSD }) => ({
    key,
    pct: yearlyCostUSD > 0 ? (yearlyTuitionUSD / yearlyCostUSD) * 100 : 0,
  }))
  const highestTuitionShare = compositionRows.sort((a, b) => b.pct - a.pct)[0]
  if (highestTuitionShare.pct > 0) {
    insights.push(
      `In ${COUNTRY_LABEL[highestTuitionShare.key]}, tuition accounts for approximately ${Math.round(highestTuitionShare.pct)}% of total yearly costs.`,
    )
  }

  return insights
}

function InsightsCard({ selectedCountries, countryData, rulesMap, displayCurrency }) {
  const insights = generateInsights(selectedCountries, countryData, rulesMap, displayCurrency)
  if (insights.length === 0) return null

  return (
    <InfoCard title="Key Observations" eyebrow="Auto-generated from current data">
      <ul className="content-list">
        {insights.map((text, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={i}>{text}</li>
        ))}
      </ul>
    </InfoCard>
  )
}

// ─── Viz 3: Cheapest programs table ──────────────────────────────────────────

function CheapestProgramsTable({ selectedCountries, countryData, displayCurrency }) {
  const sections = selectedCountries
    .map((key) => {
      const entry = countryData[key]
      const programs = entry?.cheapest_programs ?? []
      if (!programs.length) return null
      const native = entry.currency
      const curr = displayCurrencyFor(native, displayCurrency)
      return { key, programs, native, curr }
    })
    .filter(Boolean)

  if (!sections.length) return null

  return (
    <InfoCard
      title="Cheapest Programs"
      eyebrow="Top 5 lowest yearly cost per country · source: cost overview dataset"
    >
      <div className="cheapest-programs-sections">
        {sections.map(({ key, programs, native, curr }) => (
          <div key={key} className="cheapest-country-section">
            <p className="cheapest-country-label">{COUNTRY_LABEL[key]}</p>
            <div className="table-shell">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Program</th>
                    <th>University</th>
                    <th>Yearly cost</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((prog) => {
                    const costDisplay = toDisplay(prog.yearly_cost, native, displayCurrency)
                    return (
                      <tr key={prog.program_id}>
                        <td>
                          <Link className="text-link" to={`/programs/${prog.program_id}`}>
                            {prog.major_name}
                          </Link>
                        </td>
                        <td>{prog.university_name}</td>
                        <td>
                          {costDisplay !== null
                            ? `${Math.round(costDisplay).toLocaleString()} ${curr}`
                            : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </InfoCard>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

function AnalyticsPage() {
  const { currency: displayCurrency, toggleCurrency } = useAppShell()

  const [data, setData] = useState(null)
  const [rulesRaw, setRulesRaw] = useState([])
  const [selectedCountries, setSelectedCountries] = useState(() => {
    // Restore the student's last filter choice from localStorage
    try {
      const stored = window.localStorage.getItem(COUNTRY_FILTER_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed.every((k) => COUNTRY_ORDER.includes(k))
        ) {
          return parsed
        }
      }
    } catch {
      // Ignore parse / storage errors — fall back to default
    }
    return [...COUNTRY_ORDER]
  })
  const [error, setError] = useState('')

  // Persist filter choice whenever the student changes it
  useEffect(() => {
    try {
      window.localStorage.setItem(COUNTRY_FILTER_KEY, JSON.stringify(selectedCountries))
    } catch {
      // Ignore write errors (e.g. storage quota exceeded or private browsing)
    }
  }, [selectedCountries])

  useEffect(() => {
    async function loadAll() {
      const [analyticsResult, rulesResult] = await Promise.allSettled([
        getCostOverviewAnalytics(),
        getCountryRules(),
      ])
      if (analyticsResult.status === 'fulfilled') {
        setData(analyticsResult.value)
      } else {
        setError('Cost data could not be loaded from the backend.')
      }
      if (rulesResult.status === 'fulfilled') {
        setRulesRaw(rulesResult.value)
      }
      // Rules failure is silent — reality check degrades gracefully without part-time data
    }
    loadAll()
  }, [])

  // Index country rules by lowercased country_name to match cost-overview keys
  const rulesMap = rulesRaw.reduce((acc, rule) => {
    const key = (rule.country_name || '').toLowerCase()
    if (key) acc[key] = rule
    return acc
  }, {})

  const countryData = data?.countries ?? {}

  // Restrict selectedCountries to only those that exist in the data
  const availableCountries = COUNTRY_ORDER.filter((k) => countryData[k])
  const activeSelected = selectedCountries.filter((k) => availableCountries.includes(k))

  function toggleCountry(key) {
    setSelectedCountries((prev) => {
      if (prev.includes(key)) {
        const next = prev.filter((k) => k !== key)
        // Guard: at least one country with backend data must remain visible
        if (next.filter((k) => availableCountries.includes(k)).length === 0) return prev
        return next
      }
      // Guard: only add countries that exist in the current backend response
      if (!availableCountries.includes(key)) return prev
      return [...prev, key]
    })
  }

  const isUSD = displayCurrency === 'USD'

  return (
    <div className="page-stack">
      <div className="section-heading">
        <h2>Cost Overview</h2>
        <p>
          Compare average yearly costs, tuition, and monthly living expenses across countries.
          Understand how far part-time work goes before you commit.
        </p>
      </div>

      <p className="data-freshness-note">
        Dataset verified April 2026 — sourced from official university and government websites.
        Figures reflect the intake cycle recorded at that time.
      </p>

      {error ? <p className="error-text">{error}</p> : null}
      {!data && !error ? <p className="muted-text">Loading cost data…</p> : null}

      {data ? (
        <>
          {/* Controls row */}
          <div className="analytics-controls-row">
            <CountryFilterBar selected={activeSelected} onToggle={toggleCountry} />
            <p className="muted-text" style={{ margin: '0', fontSize: '0.85rem' }}>
              {isUSD ? 'Showing USD · ' : 'Showing local currencies · '}
              <button type="button" className="text-button" onClick={toggleCurrency}>
                {isUSD ? 'Switch to local →' : 'Switch to USD →'}
              </button>
            </p>
          </div>

          {/* Exchange rate reference — USD mode only */}
          <ExchangeRateCard displayCurrency={displayCurrency} />

          {/* Section A: KPI cards */}
          <KpiCards
            selectedCountries={activeSelected}
            countryData={countryData}
            displayCurrency={displayCurrency}
          />

          <p className="muted-text" style={{ fontSize: '0.78rem', margin: '-10px 0 0' }}>
            Excludes application and insurance fees. Use the Cost Calculator for a full
            per-program estimate.
          </p>

          {/* Section B: Stacked cost bar */}
          <StackedCostBar
            selectedCountries={activeSelected}
            countryData={countryData}
            displayCurrency={displayCurrency}
          />

          {/* Section C: Cheapest programs */}
          <CheapestProgramsTable
            selectedCountries={activeSelected}
            countryData={countryData}
            displayCurrency={displayCurrency}
          />

          {/* Section D: Monthly reality check */}
          <MonthlyRealityCheck
            selectedCountries={activeSelected}
            countryData={countryData}
            rulesMap={rulesMap}
            displayCurrency={displayCurrency}
          />

          {/* Section E: Auto insights */}
          <InsightsCard
            selectedCountries={activeSelected}
            countryData={countryData}
            rulesMap={rulesMap}
            displayCurrency={displayCurrency}
          />
        </>
      ) : null}
    </div>
  )
}

export default AnalyticsPage
