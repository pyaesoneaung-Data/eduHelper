import InfoCard from '../components/InfoCard'

function AnalyticsPlaceholderPage({ title, description }) {
  return (
    <InfoCard title={title} tone="muted" eyebrow="Placeholder">
      <p>{description}</p>
    </InfoCard>
  )
}

export default AnalyticsPlaceholderPage
