import InfoCard from '../components/InfoCard'
import PageHeader from '../components/PageHeader'

function LogoutPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Logout"
        title="Logout flow is reserved for a later authenticated version of the platform."
        description="This placeholder keeps the layout aligned with the planned product structure without adding unfinished authentication behavior."
      />

      <InfoCard title="Current state" tone="muted">
        <p>No sign-out action is connected yet because authentication has not been introduced in this project stage.</p>
      </InfoCard>
    </div>
  )
}

export default LogoutPage
