import { Outlet } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import SectionNav from '../components/SectionNav'

const analyticsNavItems = [
  {
    to: '/analytics',
    label: 'Cost Overview',
    description: 'Country-level yearly and living cost summaries.',
    end: true,
  },
  {
    to: '/analytics/admission',
    label: 'Admission Overview',
    description: 'GPA and IELTS thresholds from the backend dataset.',
  },
  {
    to: '/analytics/deadlines',
    label: 'Deadline Insights',
    description: 'Placeholder for upcoming deadline summaries.',
  },
  {
    to: '/analytics/ranking',
    label: 'Ranking Insights',
    description: 'Placeholder until ranking data is standardized.',
  },
]

function AnalyticsLayoutPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Analytics"
        title="Use backend summaries to compare affordability and admission barriers."
        description="Analytics stays focused on real student questions: costs, requirement barriers, and future deadline insights."
      />

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
