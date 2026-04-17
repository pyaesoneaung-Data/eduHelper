import { useEffect, useMemo, useState } from 'react'
import { getCostOverviewAnalytics } from '../api/api'
import InfoCard from '../components/InfoCard'

function formatValue(value, currency) {
  if (value === null || value === undefined) {
    return 'Not available'
  }

  return `${Number(value).toLocaleString()} ${currency ?? ''}`.trim()
}

function ComparisonRow({ label, taiwanValue, thailandValue, taiwanCurrency, thailandCurrency, maxValue }) {
  const taiwanWidth = maxValue > 0 ? `${(taiwanValue / maxValue) * 100}%` : '0%'
  const thailandWidth = maxValue > 0 ? `${(thailandValue / maxValue) * 100}%` : '0%'

  return (
    <div className="comparison-row">
      <div className="comparison-label">{label}</div>
      <div className="comparison-bars">
        <div className="comparison-country">
          <div className="comparison-country-head">
            <span>Taiwan</span>
            <strong>{formatValue(taiwanValue, taiwanCurrency)}</strong>
          </div>
          <div className="comparison-track">
            <div className="comparison-fill comparison-fill-taiwan" style={{ width: taiwanWidth }} />
          </div>
        </div>
        <div className="comparison-country">
          <div className="comparison-country-head">
            <span>Thailand</span>
            <strong>{formatValue(thailandValue, thailandCurrency)}</strong>
          </div>
          <div className="comparison-track">
            <div className="comparison-fill comparison-fill-thailand" style={{ width: thailandWidth }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function CheapestProgramsTable({ title, programs }) {
  return (
    <InfoCard title={title}>
      {programs.length ? (
        <div className="table-shell">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Program</th>
                <th>University</th>
                <th>Yearly cost</th>
                <th>Currency</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program) => (
                <tr key={program.program_id}>
                  <td>{program.major_name}</td>
                  <td>{program.university_name}</td>
                  <td>{Number(program.yearly_cost).toLocaleString()}</td>
                  <td>{program.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="muted-text">No programs were available for this country.</p>
      )}
    </InfoCard>
  )
}

function AnalyticsPage() {
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

  const comparisonMax = useMemo(() => {
    if (!data) {
      return {
        yearlyCost: 0,
        yearlyTuition: 0,
      }
    }

    return {
      yearlyCost: Math.max(
        data.countries.taiwan.average_yearly_cost,
        data.countries.thailand.average_yearly_cost,
      ),
      yearlyTuition: Math.max(
        data.countries.taiwan.average_yearly_tuition,
        data.countries.thailand.average_yearly_tuition,
      ),
    }
  }, [data])

  const taiwan = data?.countries?.taiwan
  const thailand = data?.countries?.thailand

  return (
    <div className="page-stack">
      <div className="section-heading">
        <h2>Cost Overview</h2>
        <p>
          Compare real average costs between Taiwan and Thailand using the current
          tuition and living-cost records.
        </p>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      {data ? (
        <>
          <div className="card-grid">
            <InfoCard title="Avg yearly cost: Taiwan">
              <p className="kpi-value">{formatValue(taiwan.average_yearly_cost, taiwan.currency)}</p>
            </InfoCard>
            <InfoCard title="Avg yearly cost: Thailand">
              <p className="kpi-value">{formatValue(thailand.average_yearly_cost, thailand.currency)}</p>
            </InfoCard>
            <InfoCard title="Avg monthly living cost: Taiwan">
              <p className="kpi-value">{formatValue(taiwan.average_monthly_living_cost, taiwan.currency)}</p>
            </InfoCard>
            <InfoCard title="Avg monthly living cost: Thailand">
              <p className="kpi-value">{formatValue(thailand.average_monthly_living_cost, thailand.currency)}</p>
            </InfoCard>
          </div>

          <InfoCard title="Country comparison">
            <p className="muted-text">
              Costs are shown in each country&apos;s native currency. This dashboard compares
              the dataset as stored and does not convert currencies.
            </p>
            <div className="comparison-stack">
              <ComparisonRow
                label="Average yearly cost"
                taiwanValue={taiwan.average_yearly_cost}
                thailandValue={thailand.average_yearly_cost}
                taiwanCurrency={taiwan.currency}
                thailandCurrency={thailand.currency}
                maxValue={comparisonMax.yearlyCost}
              />
              <ComparisonRow
                label="Average yearly tuition"
                taiwanValue={taiwan.average_yearly_tuition}
                thailandValue={thailand.average_yearly_tuition}
                taiwanCurrency={taiwan.currency}
                thailandCurrency={thailand.currency}
                maxValue={comparisonMax.yearlyTuition}
              />
            </div>
          </InfoCard>

          <div className="two-column-grid">
            <CheapestProgramsTable
              title="Cheapest programs in Taiwan"
              programs={taiwan.cheapest_programs}
            />
            <CheapestProgramsTable
              title="Cheapest programs in Thailand"
              programs={thailand.cheapest_programs}
            />
          </div>
        </>
      ) : null}
    </div>
  )
}

export default AnalyticsPage
