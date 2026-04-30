import InfoCard from '../components/InfoCard'
import PageHeader from '../components/PageHeader'
import BackButton from '../components/BackButton'

function AdminDashboardPage() {
  return (
    <div className="page-stack">
      <BackButton fallback="/" />
      <PageHeader
        eyebrow="Planned Admin"
        title="Admin dashboard will be added after the public MVP is stable."
        description="This route is reserved for future data update tools, source verification workflows, and content maintenance."
      />

      <div className="two-column-grid">
        <InfoCard title="Planned functions">
          <ul className="content-list">
            <li>Update program, cost, and requirement records.</li>
            <li>Track source verification and last-reviewed dates.</li>
            <li>Review country rule changes before publishing updates.</li>
          </ul>
        </InfoCard>

        <InfoCard title="Current status" tone="muted">
          <p>
            Authentication and role-based access are intentionally deferred.
            The public comparison and recommendation experience remains the first priority.
          </p>
        </InfoCard>
      </div>
    </div>
  )
}

export default AdminDashboardPage
