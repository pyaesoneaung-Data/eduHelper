import { Outlet } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import SectionNav from '../components/SectionNav'

const decisionHubItems = [
  {
    to: '/decision-hub/recommendation',
    label: 'Recommendation',
    description: 'Strict backend filters and scored results.',
  },
  {
    to: '/decision-hub/compare',
    label: 'Compare',
    description: 'Program-to-program comparison using the current endpoint.',
  },
  {
    to: '/decision-hub/cost-calculator',
    label: 'Cost Calculator',
    description: 'Yearly cost visibility beyond tuition alone.',
  },
]

function DecisionHubLayoutPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Decision Hub"
        title="Keep the main decision tools together in one working space."
        description="Recommendation, comparison, and cost review stay grouped here so students can move through one decision flow without losing context."
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
