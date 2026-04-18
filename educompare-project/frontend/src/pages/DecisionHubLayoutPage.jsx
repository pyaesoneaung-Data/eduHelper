import { Outlet } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import SectionNav from '../components/SectionNav'

const decisionHubItems = [
  {
    to: '/decision-hub/recommendation',
    label: 'Recommendation',
  },
  {
    to: '/decision-hub/compare',
    label: 'Compare',
  },
  {
    to: '/decision-hub/cost-calculator',
    label: 'Cost Calculator',
  },
]

function DecisionHubLayoutPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Decision hub"
        title="Recommendation, compare, and cost review stay in one workspace."
        description="Use the left menu as a persistent decision workspace. Keep strict backend filters, compare programs directly, and review real yearly costs without moving across separate page layouts."
      />

      <section className="section-shell">
        <SectionNav items={decisionHubItems} label="Decision Hub sections" />
        <div className="section-content">
          <Outlet />
        </div>
      </section>
    </div>
  )
}

export default DecisionHubLayoutPage
