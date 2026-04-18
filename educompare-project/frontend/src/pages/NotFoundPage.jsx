import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

function NotFoundPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Not Found"
        title="That page is not available."
        description="Return to the dashboard and continue reviewing verified program, cost, and legal information."
      >
        <Link className="primary-button" to="/">
          Return home
        </Link>
      </PageHeader>
    </div>
  )
}

export default NotFoundPage
