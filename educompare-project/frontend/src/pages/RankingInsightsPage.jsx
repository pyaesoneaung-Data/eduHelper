import { useEffect, useState } from 'react'
import { getRankingOverview } from '../api/api'
import InfoCard from '../components/InfoCard'

const COUNTRY_ORDER = ['Singapore', 'Taiwan', 'Thailand']

const PENDING_COUNTRIES = ['Taiwan', 'Thailand']

function RankBadge({ rank }) {
  const isTop = rank <= 100
  return (
    <span className={`ranking-rank-cell${isTop ? ' ranking-rank-top' : ''}`}>
      #{rank}
    </span>
  )
}

function RankingTable({ universities }) {
  if (!universities.length) {
    return <p className="muted-text">No ranked universities in this group.</p>
  }

  return (
    <div className="table-shell">
      <table className="compare-table">
        <thead>
          <tr>
            <th>QS Rank</th>
            <th>University</th>
            <th>City</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {universities.map((u) => (
            <tr key={u.university_id}>
              <td>
                <RankBadge rank={u.world_rank} />
              </td>
              <td>
                <a
                  href={u.official_website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-link"
                >
                  {u.university_name}
                </a>
              </td>
              <td>{u.city}</td>
              <td>{u.university_type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RankingInsightsPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const response = await getRankingOverview()
        setData(response)
      } catch {
        setError('Ranking data could not be loaded from the backend.')
      }
    }
    load()
  }, [])

  const universities = data?.universities ?? []

  const byCountry = {}
  universities.forEach((u) => {
    const key = u.country_name
    if (!byCountry[key]) byCountry[key] = []
    byCountry[key].push(u)
  })

  const rankedCountries = COUNTRY_ORDER.filter((c) => byCountry[c]?.length > 0)

  return (
    <div className="page-stack">
      <div className="section-heading">
        <h2>Ranking Insights</h2>
        <p>World university rankings for institutions in our dataset, sourced from QS World University Rankings.</p>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {!data && !error ? <p className="muted-text">Loading ranking data...</p> : null}

      {data ? (
        <>
          <InfoCard
            title="Data source"
            eyebrow="QS World University Rankings 2025"
          >
            <p className="muted-text">
              Rankings are taken from the QS World University Rankings — one of the most widely referenced
              international university ranking systems. Only institutions with a verified QS rank are listed.
              A rank of #1–100 is highlighted in green. Verify current rankings at{' '}
              <a
                href="https://www.topuniversities.com/world-university-rankings"
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                topuniversities.com
              </a>
              .
            </p>
          </InfoCard>

          {rankedCountries.map((country) => (
            <InfoCard key={country} title={`${country}: QS World Rankings`}>
              <RankingTable universities={byCountry[country]} />
            </InfoCard>
          ))}

          {PENDING_COUNTRIES.length > 0 ? (
            <InfoCard title="Pending ranking data">
              <p className="muted-text">
                Ranking data for the following countries is not yet included in our dataset.
                Rankings will be added when verified QS data becomes available.
              </p>
              <div className="pending-country-tags">
                {PENDING_COUNTRIES.map((c) => (
                  <span key={c} className="pending-country-tag">
                    {c}: pending
                  </span>
                ))}
              </div>
            </InfoCard>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

export default RankingInsightsPage
