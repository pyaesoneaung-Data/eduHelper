import { useEffect, useState } from 'react'
import { getCostOverviewAnalytics } from '../api/api'
import { useAppShell } from '../context/AppShellContext'
import InfoCard from '../components/InfoCard'
import {
  convertCurrency,
  FROM_USD,
  EXCHANGE_RATE_DATE,
} from '../utils/currency'

// Native currency for each country key returned by the backend
const COUNTRY_CURRENCY = {
  taiwan: 'TWD',
  thailand: 'THB',
  singapore: 'SGD',
}

const COUNTRY_LABEL = {
  taiwan: 'Taiwan',
  thailand: 'Thailand',
  singapore: 'Singapore',
}

// Bar fill class per country
const COUNTRY_FILL_CLASS = {
  taiwan: 'comparison-fill-taiwan',
  thailand: 'comparison-fill-thailand',
  singapore: 'comparison-fill-singapore',
}

function formatValue(value, currency) {
  if (value === null || value === undefined) return 'Not available'
  return `${Math.round(Number(value)).toLocaleString()} ${currency ?? ''}`.trim()
}

function ExchangeRateCard({ displayCurrency }) {
  if (displayCurrency === 'USD') {
    return (
      <InfoCard title="USD reference rates" eyebrow={`As of ${EXCHANGE_RATE_DATE} · Source: XE.com`}>
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
        <p className="muted-text" style={{ marginTop: '12px' }}>
          All costs on this page are converted to USD using these rates. Verify current rates at{' '}
          <a className="text-link" href="https://www.xe.com" target="_blank" rel="noreferrer">
            XE.com
          </a>{' '}
          before making financial decisions.
        </p>
      </InfoCard>
    )
  }

  return (
    <InfoCard title="Exchange rate reference" eyebrow={`As of ${EXCHANGE_RATE_DATE} · Source: XE.com`}>
      <p className="muted-text">
        Costs are shown in each country&apos;s own currency — Taiwan in TWD, Thailand in THB, Singapore in SGD.
        Switch to USD mode for a direct cross-country comparison. Verify current rates at{' '}
        <a
          className="text-link"
          href="https://www.xe.com"
          target="_blank"
          rel="noreferrer"
        >
          XE.com
        </a>{' '}
        before making financial decisions.
      </p>
    </InfoCard>
  )
}

function ComparisonRow({ label, entries, maxValue }) {
  // entries: [{ key, value, currency }]
  return (
    <div className="comparison-row">
      <div className="comparison-label">{label}</div>
      <div className="comparison-bars">
        {entries.map(({ key, value, currency }) => {
          const width = maxValue > 0 ? `${(value / maxValue) * 100}%` : '0%'
          return (
            <div key={key} className="comparison-country">
              <div className="comparison-country-head">
                <span>{COUNTRY_LABEL[key] ?? key}</span>
                <strong>{formatValue(value, currency)}</strong>
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

function AnalyticsPage() {
  const { currency: displayCurrency, toggleCurrency } = useAppShell()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await getCostOverviewAnalytics()
        setData(response)
      } catch {
        setError('Analytics data could not be loaded from the backend.')
      }
    }

    loadAnalytics()
  }, [])

  const isUSD = displayCurrency === 'USD'
  const countryData = data?.countries ?? {}
  const countryKeys = Object.keys(countryData)

  function toDisplay(amount, nativeCurrency) {
    if (amount === null || amount === undefined) return null
    if (!isUSD) return Number(amount)
    return convertCurrency(Number(amount), nativeCurrency, 'USD')
  }

  function displayCurrencyFor(key) {
    return isUSD ? 'USD' : (COUNTRY_CURRENCY[key] ?? 'USD')
  }

  const yearlyCostMax = Math.max(
    ...countryKeys.map((key) => {
      const native = COUNTRY_CURRENCY[key]
      return toDisplay(countryData[key]?.average_yearly_cost, native) ?? 0
    }),
    0,
  )

  const yearlyTuitionMax = Math.max(
    ...countryKeys.map((key) => {
      const native = COUNTRY_CURRENCY[key]
      return toDisplay(countryData[key]?.average_yearly_tuition, native) ?? 0
    }),
    0,
  )

  return (
    <div className="page-stack">
      <div className="section-heading">
        <h2>Cost Overview</h2>
        <p>Compare average yearly costs and tuition using backend-provided country summaries.</p>
      </div>

      <p className="data-freshness-note">
        Dataset verified April 2026 — sourced from official university and government websites.
        Figures reflect the intake cycle recorded at that time.
      </p>

      {error ? <p className="error-text">{error}</p> : null}

      {!data && !error ? <p className="muted-text">Loading cost data...</p> : null}

      {data ? (
        <>
          <p className="muted-text">
            {isUSD ? 'Costs converted to USD. ' : 'Costs shown in local currencies. '}
            <button type="button" className="text-button" onClick={toggleCurrency}>
              {isUSD ? 'Switch to local →' : 'Switch to USD →'}
            </button>
          </p>

          <div className="card-grid">
            {countryKeys.map((key) => {
              const native = COUNTRY_CURRENCY[key]
              const label = COUNTRY_LABEL[key] ?? key
              const curr = displayCurrencyFor(key)
              return (
                <InfoCard key={key} title={`Avg yearly cost: ${label}`}>
                  <p className="kpi-value">
                    {formatValue(toDisplay(countryData[key]?.average_yearly_cost, native), curr)}
                  </p>
                </InfoCard>
              )
            })}
            {countryKeys.map((key) => {
              const native = COUNTRY_CURRENCY[key]
              const label = COUNTRY_LABEL[key] ?? key
              const curr = displayCurrencyFor(key)
              return (
                <InfoCard key={`living-${key}`} title={`Avg monthly living: ${label}`}>
                  <p className="kpi-value">
                    {formatValue(toDisplay(countryData[key]?.average_monthly_living_cost, native), curr)}
                  </p>
                </InfoCard>
              )
            })}
          </div>

          <ExchangeRateCard displayCurrency={displayCurrency} />

          <InfoCard title="Country comparison">
            {isUSD ? (
              <p className="muted-text">
                All values converted to USD — bar widths are directly comparable.
              </p>
            ) : (
              <p className="muted-text">
                Each bar reflects values in that country&apos;s own currency.
                Bar widths are <strong>not exchange-rate adjusted</strong> — use USD mode for a fair comparison.
              </p>
            )}
            <div className="comparison-stack">
              <ComparisonRow
                label="Average yearly cost"
                entries={countryKeys.map((key) => ({
                  key,
                  value: toDisplay(countryData[key]?.average_yearly_cost, COUNTRY_CURRENCY[key]) ?? 0,
                  currency: displayCurrencyFor(key),
                }))}
                maxValue={yearlyCostMax}
              />
              <ComparisonRow
                label="Average yearly tuition"
                entries={countryKeys.map((key) => ({
                  key,
                  value: toDisplay(countryData[key]?.average_yearly_tuition, COUNTRY_CURRENCY[key]) ?? 0,
                  currency: displayCurrencyFor(key),
                }))}
                maxValue={yearlyTuitionMax}
              />
            </div>
          </InfoCard>
        </>
      ) : null}
    </div>
  )
}

export default AnalyticsPage
