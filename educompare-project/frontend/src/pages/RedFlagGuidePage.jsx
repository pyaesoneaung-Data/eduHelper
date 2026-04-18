import InfoCard from '../components/InfoCard'
import PageHeader from '../components/PageHeader'

function RedFlagGuidePage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Red Flag Guide"
        title="Keep warning signs visible before any payment, deposit, or admission promise is accepted."
        description="This guide stays inside the dashboard so risk checks are part of the same decision flow as cost, comparison, and legal review."
      />

      <div className="card-grid">
        <InfoCard title="Guaranteed admission fee" eyebrow="Red flag 1">
          <p>
            A promise of guaranteed admission in exchange for extra fees is a major red flag.
            Admissions decisions depend on the institution, not agent confidence.
          </p>
        </InfoCard>

        <InfoCard title="Always verify official sources" eyebrow="Red flag 2">
          <p>
            Check university websites, official admissions pages, and government visa sources.
            Do not rely only on screenshots, social media clips, or agent summaries.
          </p>
        </InfoCard>

        <InfoCard title="Tuition is not the total cost" eyebrow="Red flag 3">
          <p>
            Tuition figures can hide application fees, insurance, deposits, and yearly living expenses.
            Always calculate the full yearly burden before deciding.
          </p>
        </InfoCard>

        <InfoCard title="Check legal work rights" eyebrow="Red flag 4">
          <p>
            Part-time work rules vary by country and often require permits.
            If someone promises easy income without explaining legal restrictions, treat the claim carefully.
          </p>
        </InfoCard>
      </div>

      <InfoCard title="Before paying anything" tone="muted" eyebrow="Checklist">
        <ul className="content-list">
          <li>Confirm the program exists on the official university site and that the deadline matches the university record.</li>
          <li>Calculate tuition, living cost, insurance, and any listed fees together instead of trusting a low tuition headline.</li>
          <li>Read the country work-rights note before assuming part-time income can offset yearly costs.</li>
          <li>Keep any promise that sounds risk-free under suspicion until it is backed by official documentation.</li>
        </ul>
      </InfoCard>
    </div>
  )
}

export default RedFlagGuidePage
