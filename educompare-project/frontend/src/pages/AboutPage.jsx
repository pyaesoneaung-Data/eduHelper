import InfoCard from '../components/InfoCard'
import PageHeader from '../components/PageHeader'

function AboutPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="About"
        title="UniMatch"
        description="A trustworthy student decision platform for comparing universities across Thailand, Taiwan, and Singapore."
      />

      <div className="two-column-grid">
        <InfoCard title="What is UniMatch?">
          <p className="muted-text">
            UniMatch helps international students compare university programs using verified data —
            not social media claims or agent marketing. All cost, admission, and deadline
            information is sourced directly from official university and government websites.
          </p>
        </InfoCard>

        <InfoCard title="Who is it for?">
          <p className="muted-text">
            Students considering bachelor&apos;s or master&apos;s programs in Thailand, Taiwan,
            or Singapore who need clear, honest comparisons before making a decision.
          </p>
        </InfoCard>
      </div>

      <InfoCard title="Platform">
        <div className="detail-grid">
          <div>
            <p className="muted-text" style={{ marginBottom: '4px' }}>Version</p>
            <p className="kpi-value" style={{ fontSize: '1rem' }}>Beta</p>
          </div>
          <div>
            <p className="muted-text" style={{ marginBottom: '4px' }}>Dataset last verified</p>
            <p className="kpi-value" style={{ fontSize: '1rem' }}>April 2026</p>
          </div>
          <div>
            <p className="muted-text" style={{ marginBottom: '4px' }}>Countries covered</p>
            <p className="kpi-value" style={{ fontSize: '1rem' }}>3</p>
          </div>
        </div>
      </InfoCard>

      <InfoCard title="Data &amp; sources">
        <p className="muted-text">
          All university, program, cost, and admission data is collected from official sources and
          verified at the date shown above. Rankings are sourced from the QS World University
          Rankings. Exchange rates are sourced from XE.com. No data is generated or estimated —
          if a field is missing, it means no verified value was available.
        </p>
      </InfoCard>

      <InfoCard title="Disclaimer">
        <p className="muted-text">
          UniMatch is a portfolio research project and is not affiliated with any university,
          government body, or education agency. Data accuracy is not guaranteed. Always verify
          directly with the university before making any application or financial decision.
        </p>
      </InfoCard>
    </div>
  )
}

export default AboutPage
