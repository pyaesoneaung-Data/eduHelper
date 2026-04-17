import InfoCard from '../components/InfoCard'
import PageHeader from '../components/PageHeader'

function RedFlagGuidePage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Red Flag Guide"
        title="Use these checks before paying an agent or accepting a claim."
        description="This is a static warning page designed to help students spot common manipulation tactics in study-abroad marketing."
      />

      <div className="card-grid">
        <InfoCard title="Guaranteed admission fee">
          <p>
            A promise of guaranteed admission in exchange for extra fees is a major red flag.
            Admissions decisions depend on the institution, not agent confidence.
          </p>
        </InfoCard>

        <InfoCard title="Always verify official sources">
          <p>
            Check university websites, official admissions pages, and government visa sources.
            Do not rely only on screenshots, social media clips, or agent summaries.
          </p>
        </InfoCard>

        <InfoCard title="Tuition is not the total cost">
          <p>
            Tuition figures can hide application fees, insurance, deposits, and yearly living expenses.
            Always calculate the full yearly burden before deciding.
          </p>
        </InfoCard>

        <InfoCard title="Check legal work rights">
          <p>
            Part-time work rules vary by country and often require permits.
            If someone promises easy income without explaining legal restrictions, treat the claim carefully.
          </p>
        </InfoCard>
      </div>
    </div>
  )
}

export default RedFlagGuidePage
