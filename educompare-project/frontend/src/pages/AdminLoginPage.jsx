import InfoCard from '../components/InfoCard'
import PageHeader from '../components/PageHeader'

function AdminLoginPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Admin Placeholder"
        title="Admin login route is reserved for future access control."
        description="This placeholder keeps the app structure ready for a later role-based admin flow without creating a separate frontend."
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
