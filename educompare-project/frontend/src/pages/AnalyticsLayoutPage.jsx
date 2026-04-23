import { Outlet } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import SectionNav from '../components/SectionNav'

const analyticsNavItems = [
  {
    to: '/analytics',
    label: 'Cost Overview',
    end: true,
  },
  {
    to: '/analytics/admission',
    label: 'Admission Overview',
  },
  {
    to: '/analytics/deadlines',
    label: 'Deadline Insights',
  },
  {
    to: '/analytics/ranking',
    label: 'Ranking Insights',
  },
]

function AnalyticsLayoutPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Analytics"
        title="Compare study-abroad decisions through clear, verified summaries."
        description="Use analytics views to inspect cost and admission patterns without leaving the main application flow."
      />
      <p className="data-freshness-note">
        Dataset verified April 2026 — sourced from official university and government websites.
        Figures reflect the intake cycle recorded at that time.
      </p>

      <section className="section-shell">
        <SectionNav items={analyticsNavItems} label="Analytics sections" />
        <div className="section-content">
          <Outlet />
        </div>
      </section>
    </div>
  )
}

export default AnalyticsLayoutPage
