import { Link } from 'react-router-dom'
import InfoCard from '../components/InfoCard'
import PageHeader from '../components/PageHeader'

function HomePage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="UniMatch / EduCompare"
        title="Compare university programs with real data, not advertising."
        description="This platform helps first-generation international students review real costs, admission requirements, legal work rules, and direct program comparisons before making a study-abroad decision."
      >
        <div className="action-row">
          <Link className="primary-button" to="/recommend">
            Open recommendation tool
          </Link>
          <Link className="secondary-button" to="/compare">
            Compare programs
          </Link>
        </div>
      </PageHeader>

      <div className="feature-grid">
        <InfoCard title="Why this exists">
          <p>
            Many students are shown polished marketing claims but not the real
            yearly cost, legal work limits, or actual admission thresholds.
            UniMatch is designed to surface those facts clearly.
          </p>
        </InfoCard>

        <InfoCard title="What you can do">
          <ul className="content-list">
            <li>Match programs by country, degree level, language, budget, GPA, and IELTS.</li>
            <li>Compare two programs side by side.</li>
            <li>Review cost summaries with living expenses included.</li>
            <li>Check visa and legal work rules before trusting agent claims.</li>
          </ul>
        </InfoCard>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <h2>Explore the MVP</h2>
          <p>Each section is focused on clarity, verification, and decision support.</p>
        </div>
        <div className="link-grid">
          <Link className="link-card" to="/recommend">
            Recommendation
          </Link>
          <Link className="link-card" to="/compare">
            Compare
          </Link>
          <Link className="link-card" to="/cost-calculator">
            Cost Calculator
          </Link>
          <Link className="link-card" to="/legal">
            Legal Info
          </Link>
          <Link className="link-card" to="/red-flags">
            Red Flag Guide
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
