import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { getCostOverviewAnalytics, getCountryRules } from '../api/api'
import InfoCard from '../components/InfoCard'
import {
  convertCurrency,
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

const COUNTRY_COLORS_PIE = {
  taiwan: '#2d6aa0',
  thailand: '#e8893e',
  singapore: '#5a9e7a',
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

// ─── Viz A: Country cost columns ─────────────────────────────────────────────

function CountryCostColumns({ selectedCountries, countryData }) {
  const cols = selectedCountries
    .map((key) => {
      const entry = countryData[key]
      if (!entry) return null
      const native = entry.currency
      const tuitionUSD = Math.round(convertCurrency(entry.average_yearly_tuition, native, 'USD') ?? 0)
      const livingYearlyUSD = Math.round((convertCurrency(entry.average_monthly_living_cost, native, 'USD') ?? 0) * 12)
      const totalUSD = tuitionUSD + livingYearlyUSD
      const tuitionPct = totalUSD > 0 ? Math.round((tuitionUSD / totalUSD) * 100) : 0
      const livingPct = 100 - tuitionPct
      return { key, tuitionUSD, livingYearlyUSD, totalUSD, tuitionPct, livingPct }
    })
    .filter(Boolean)

  if (!cols.length) return null

  return (
    <InfoCard title="Cost Breakdown" eyebrow="Average annual cost · tuition + living expenses (×12 months)">
      <div className="cost-columns-grid">
        {cols.map(({ key, tuitionUSD, livingYearlyUSD, totalUSD, tuitionPct, livingPct }) => (
          <div key={key} className="cost-column">
            <div className="cost-col-header">
              <span className="cost-col-country">{COUNTRY_LABEL[key]}</span>
              <span className="cost-col-total">${totalUSD.toLocaleString()}</span>
            </div>
            <div className="cost-col-breakdown">
              <div className="cost-col-item cost-col-tuition">
                <span className="cost-col-label">Tuition</span>
                <span className="cost-col-amount">${tuitionUSD.toLocaleString()}</span>
                <span className="cost-col-pct">({tuitionPct}%)</span>
              </div>
              <div className="cost-col-item cost-col-living">
                <span className="cost-col-label">Living Cost</span>
                <span className="cost-col-amount">${livingYearlyUSD.toLocaleString()}</span>
                <span className="cost-col-pct">({livingPct}%)</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </InfoCard>
  )
}

// ─── Viz B: Cost share pie chart ──────────────────────────────────────────────

function CountryCostPie({ selectedCountries, countryData }) {
  const pieData = selectedCountries
    .map((key) => {
      const entry = countryData[key]
      if (!entry) return null
      const native = entry.currency
      const tuitionUSD = convertCurrency(entry.average_yearly_tuition, native, 'USD') ?? 0
      const livingYearlyUSD = (convertCurrency(entry.average_monthly_living_cost, native, 'USD') ?? 0) * 12
      const totalUSD = Math.round(tuitionUSD + livingYearlyUSD)
      return {
        name: COUNTRY_LABEL[key],
        value: totalUSD,
        color: COUNTRY_COLORS_PIE[key] ?? '#888888',
      }
    })
    .filter(Boolean)

  const totalAll = pieData.reduce((sum, d) => sum + d.value, 0)

  if (!pieData.length) return null

  const RADIAN = Math.PI / 180
  const renderPctLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={11} fontWeight={600}>
        {`${Math.round(percent * 100)}%`}
      </text>
    )
  }

  return (
    <InfoCard title="Cost Share By Country" eyebrow="Each country's share of combined annual cost">
      <div className="pie-chart-layout">
        <div className="pie-chart-area">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={renderPctLabel}
                labelLine={false}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`$${value.toLocaleString()}`, 'Annual cost']}
                contentStyle={{
                  background: 'var(--panel-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  color: 'var(--text)',
                  fontSize: '0.82rem',
                }}
                itemStyle={{ color: 'var(--text)' }}
                labelStyle={{ color: 'var(--text)', fontWeight: 600, marginBottom: 2 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <p className="pie-combined-total">
            Combined total&nbsp;&nbsp;<span>${totalAll.toLocaleString()}</span>
          </p>
        </div>
        <div className="pie-legend">
          {pieData.map((entry) => {
            return (
              <div key={entry.name} className="pie-legend-item">
                <span className="pie-legend-dot" style={{ background: entry.color }} />
                <div className="pie-legend-copy">
                  <span className="pie-legend-name">{entry.name}</span>
                  <span className="pie-legend-value">${entry.value.toLocaleString()}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </InfoCard>
  )
}

// ─── Viz C: Tuition vs Living horizontal stacked bar ─────────────────────────

const TOOLTIP_STYLE = {
  background: 'var(--panel-bg)',
  border: '1px solid var(--border)',
  borderRadius: '4px',
  color: 'var(--text)',
  fontSize: '0.82rem',
}

const TOOLTIP_LABEL_STYLE = { color: 'var(--text)', fontWeight: 600, marginBottom: 2 }

function TuitionVsLivingBar({ selectedCountries, countryData }) {
  const barData = selectedCountries
    .map((key) => {
      const entry = countryData[key]
      if (!entry) return null
      const native = entry.currency
      const tuitionUSD = Math.round(convertCurrency(entry.average_yearly_tuition, native, 'USD') ?? 0)
      const livingYearlyUSD = Math.round((convertCurrency(entry.average_monthly_living_cost, native, 'USD') ?? 0) * 12)
      return { key, name: COUNTRY_LABEL[key], tuition: tuitionUSD, living: livingYearlyUSD }
    })
    .filter(Boolean)

  if (!barData.length) return null

  return (
    <InfoCard title="Tuition vs Living Cost" eyebrow="Annual breakdown per country · USD">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart layout="vertical" data={barData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
            tick={{ fontSize: 11, fill: 'var(--muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={75}
            tick={{ fontSize: 12, fill: 'var(--text)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value, name) => [`$${value.toLocaleString()}`, name]}
            contentStyle={TOOLTIP_STYLE}
            itemStyle={{ color: 'var(--text)' }}
            labelStyle={TOOLTIP_LABEL_STYLE}
            cursor={{ fill: 'var(--border)', opacity: 0.5 }}
          />
          <Legend
            iconType="square"
            iconSize={10}
            verticalAlign="top"
            align="right"
            wrapperStyle={{ fontSize: '0.8rem', paddingBottom: '8px' }}
          />
          <Bar name="Tuition" stackId="a" dataKey="tuition" fill="var(--accent)" radius={0} />
          <Bar name="Living Cost" stackId="a" dataKey="living" fill="#c9a071" radius={[0, 2, 2, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </InfoCard>
  )
}

// ─── Viz D: Monthly commitment vertical bar ───────────────────────────────────

function MonthlyCommitmentBar({ selectedCountries, countryData }) {
  const barData = selectedCountries
    .map((key) => {
      const entry = countryData[key]
      if (!entry) return null
      const native = entry.currency
      const tuitionUSD = convertCurrency(entry.average_yearly_tuition, native, 'USD') ?? 0
      const livingMonthlyUSD = convertCurrency(entry.average_monthly_living_cost, native, 'USD') ?? 0
      const monthly = Math.round(tuitionUSD / 12 + livingMonthlyUSD)
      return { key, name: COUNTRY_LABEL[key], monthly }
    })
    .filter(Boolean)

  if (!barData.length) return null

  return (
    <InfoCard title="Monthly Commitment" eyebrow="Estimated monthly budget · tuition spread over 12 months + living">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={barData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: 'var(--text)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `$${v.toLocaleString()}`}
            tick={{ fontSize: 11, fill: 'var(--muted)' }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip
            formatter={(value) => [`$${value.toLocaleString()}/mo`, 'Monthly commitment']}
            contentStyle={TOOLTIP_STYLE}
            itemStyle={{ color: 'var(--text)' }}
            labelStyle={TOOLTIP_LABEL_STYLE}
            cursor={{ fill: 'var(--border)', opacity: 0.5 }}
          />
          <Bar dataKey="monthly" radius={[3, 3, 0, 0]}>
            {barData.map((entry) => (
              <Cell key={entry.name} fill={COUNTRY_COLORS_PIE[entry.key] ?? 'var(--accent)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </InfoCard>
  )
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

// ─── Viz 2: Monthly reality check ────────────────────────────────────────────

function MonthlyRealityCheck({ selectedCountries, countryData, rulesMap, displayCurrency }) {
  const isUSD = displayCurrency === 'USD'

  // Always show no-permit countries regardless of filter — important policy info students must see
  const noWorkCountries = COUNTRY_ORDER
    .filter((k) => rulesMap[k]?.part_time_allowed === false)
    .map((k) => COUNTRY_LABEL[k])

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
    .filter((r) => r !== null && r.partTimeAllowed !== false)

  return (
    <InfoCard
      title="Monthly Reality Check"
      eyebrow="How far part-time income goes each month"
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
                {workHourLimit ? (
                  <span className="muted-text" style={{ fontSize: '0.8rem' }}>
                    max {workHourLimit} hrs/wk
                  </span>
                ) : null}
              </div>

              <div className="reality-stats">
                <div className="reality-stat">
                  <span className="reality-stat-label">Monthly living</span>
                  <span className="reality-stat-value">
                    {Math.round(monthlyLivingDisplay).toLocaleString()} {curr}
                  </span>
                </div>
                {partTimeDisplay !== null ? (
                  <div className="reality-stat">
                    <span className="reality-stat-label">Part-time income</span>
                    <span className="reality-stat-value">
                      ~{Math.round(partTimeDisplay).toLocaleString()} {curr}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="reality-track-shell">
                <div className="reality-fill" style={{ width: `${coveragePct}%` }} />
              </div>

              {partTimeDisplay !== null ? (
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
                        ? `~${Math.round(gapDisplay * 12).toLocaleString()} ${curr}/year gap to cover`
                        : `~${Math.round(surplusDisplay * 12).toLocaleString()} ${curr}/year surplus`}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ),
        )}
      </div>

      <p className="muted-text" style={{ marginTop: '16px', fontSize: '0.78rem' }}>
        Estimates based on minimum wage × legal hour limit. Actual earnings vary.
      </p>

      {noWorkCountries.length > 0 ? (
        <p className="reality-static-note">
          <strong>{noWorkCountries.join(' & ')}</strong>
          {noWorkCountries.length > 1 ? ' do' : ' does'} not permit part-time work for international students on a student visa.
        </p>
      ) : null}
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
    `${COUNTRY_LABEL[cheapest.key]} has the lowest estimated yearly cost at ${Math.round(cheapest.yearlyCostDisplay).toLocaleString()} ${cheapest.curr}/yr.`,
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
      `Part-time work in ${COUNTRY_LABEL[best.key]} can cover about ${Math.round(best.pct)}% of average monthly living costs.`,
    )
  }

  const nonPermitted = selectedCountries.filter((k) => rulesMap[k]?.part_time_allowed === false)
  if (nonPermitted.length > 0) {
    insights.push(
      `${nonPermitted.map((k) => COUNTRY_LABEL[k]).join(', ')} ${nonPermitted.length > 1 ? 'do' : 'does'} not permit part-time work on a student visa — full living costs must be covered without part-time income.`,
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
    <InfoCard title="Key Observations" eyebrow="Based on your selected countries">
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
      eyebrow="Top 5 lowest-cost programs per country"
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
  const displayCurrency = 'USD'

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

  return (
    <div className="page-stack">
      <div className="section-heading">
        <div className="section-heading-title-row">
          <h2>Cost Overview</h2>
          <span className="page-currency-badge">All values in USD</span>
        </div>
        <p>
          Compare average yearly costs, tuition, and living expenses across countries.
          See how part-time income stacks up against monthly costs.
        </p>
      </div>

      <p className="data-freshness-note">
        Data verified April 2026 · sourced from official university and government websites.
      </p>

      {error ? <p className="error-text">{error}</p> : null}
      {!data && !error ? <p className="muted-text">Loading cost data…</p> : null}

      {data ? (
        <>
          {/* Controls row */}
          <div className="analytics-controls-row">
            <CountryFilterBar selected={activeSelected} onToggle={toggleCountry} />
          </div>

          {/* Section A: Cost Breakdown columns + Pie chart */}
          <div className="cost-overview-viz-grid">
            <CountryCostColumns
              selectedCountries={activeSelected}
              countryData={countryData}
            />
            <CountryCostPie
              selectedCountries={activeSelected}
              countryData={countryData}
            />
          </div>
          <p className="muted-text" style={{ fontSize: '0.78rem', margin: '-10px 0 0' }}>
            Excludes application and insurance fees. Use the Cost Calculator for a full per-program estimate.
          </p>

          {/* Section B: Tuition vs Living bar + Monthly commitment bar */}
          <div className="cost-charts-grid">
            <TuitionVsLivingBar
              selectedCountries={activeSelected}
              countryData={countryData}
            />
            <MonthlyCommitmentBar
              selectedCountries={activeSelected}
              countryData={countryData}
            />
          </div>

          {/* Section C: Monthly reality check */}
          <MonthlyRealityCheck
            selectedCountries={activeSelected}
            countryData={countryData}
            rulesMap={rulesMap}
            displayCurrency={displayCurrency}
          />

          {/* Section D: Key observations */}
          <InsightsCard
            selectedCountries={activeSelected}
            countryData={countryData}
            rulesMap={rulesMap}
            displayCurrency={displayCurrency}
          />

          {/* Section E: Cheapest programs */}
          <CheapestProgramsTable
            selectedCountries={activeSelected}
            countryData={countryData}
            displayCurrency={displayCurrency}
          />

          {/* Section F: Exchange rate reference */}
          <ExchangeRateCard displayCurrency={displayCurrency} />
        </>
      ) : null}
    </div>
  )
}

export default AnalyticsPage
