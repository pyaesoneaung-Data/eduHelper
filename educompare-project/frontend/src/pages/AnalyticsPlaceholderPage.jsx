import InfoCard from '../components/InfoCard'

function AnalyticsPlaceholderPage({ title, description }) {
  return (
    <InfoCard title={title} tone="muted" eyebrow="Planned section">
      <p>{description}</p>
      <p className="muted-text">
        This section stays visible to preserve the final analytics workspace structure, but no misleading chart is shown before the backend data is ready.
      </p>
    </InfoCard>
  )
}

export default AnalyticsPlaceholderPage
