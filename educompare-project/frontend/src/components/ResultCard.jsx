import { Link } from 'react-router-dom'
import { useAppShell } from '../context/AppShellContext'
import { convertCurrency } from '../utils/currency'
import { formatDate, isDeadlinePassed } from '../utils/date'

const COUNTRY_NAMES = {
  C001: 'Taiwan',
  C002: 'Thailand',
  C003: 'Singapore',
}

const CRITERIA_LABELS = {
  budget_fit: 'Budget',
  gpa_fit: 'GPA',
  ielts_fit: 'IELTS',
  deadline_fit: 'Deadline',
}

function formatCost(value, nativeCurrency, displayCurrency) {
  if (value === null || value === undefined) return 'Not available'
  const isUSD = displayCurrency === 'USD'
  const amount = isUSD ? convertCurrency(Number(value), nativeCurrency, 'USD') : Number(value)
  const label = isUSD ? 'USD' : (nativeCurrency ?? '')
  return `${Math.round(amount).toLocaleString()} ${label}`.trim()
}

function ResultCard({ item }) {
  const { currency: displayCurrency } = useAppShell()
  const deadlinePassed = isDeadlinePassed(item.application_deadline)
  const metCriteria = Object.entries(item.score_breakdown ?? {}).filter(([, v]) => v > 0)

  return (
    <article className="result-card">
      <div className="result-card-header">
        <p className="result-meta">{`${COUNTRY_NAMES[item.country_id] ?? item.country_id} • ${item.degree_level}`}</p>
        <h3>
          <Link to={`/programs/${item.program_id}`} className="result-title-link">
            {item.major_name}
          </Link>
        </h3>
        <p className="muted-text">{item.university_name}</p>
      </div>

      <dl className="detail-grid compact">
        <div>
          <dt>Language</dt>
          <dd>{item.instruction_language}</dd>
        </div>
        <div>
          <dt>Estimated yearly cost</dt>
          <dd>{formatCost(item.estimated_yearly_cost, item.currency, displayCurrency)}</dd>
        </div>
        <div>
          <dt>Minimum GPA</dt>
          <dd>{item.required_min_gpa ?? 'Not listed'}</dd>
        </div>
        <div>
          <dt>Minimum IELTS</dt>
          <dd>{item.required_ielts ?? 'Not listed'}</dd>
        </div>
        <div>
          <dt>Deadline</dt>
          <dd className={deadlinePassed ? 'deadline-passed' : ''}>
            {formatDate(item.application_deadline) ?? 'Not listed'}
            {deadlinePassed ? ' — Deadline passed' : ''}
          </dd>
        </div>
      </dl>

      {metCriteria.length > 0 ? (
        <div className="match-tags">
          <span className="match-tags-label">Requirements met</span>
          <div className="match-tags-row">
            {metCriteria.map(([key]) => (
              <span key={key} className="match-tag">
                {CRITERIA_LABELS[key] ?? key.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="result-no-match">No requirements matched your profile — shown for reference.</p>
      )}
    </article>
  )
}

export default ResultCard
