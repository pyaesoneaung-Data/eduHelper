import InfoCard from '../components/InfoCard'
import PageHeader from '../components/PageHeader'
import BackButton from '../components/BackButton'

function AdminLoginPage() {
  return (
    <div className="page-stack">
      <BackButton fallback="/" />
      <PageHeader
        eyebrow="Planned Admin"
        title="Admin login route is reserved for future access control."
        description="This route remains in place so the future admin workflow can be added without restructuring the public dashboard."
      />

      <InfoCard title="Why this page exists">
        <p>
          UniMatch will later need protected tools for verified data updates.
          For now, this page exists only to preserve the route structure and future expansion path.
        </p>
      </InfoCard>
    </div>
  )
}

export default AdminLoginPage
