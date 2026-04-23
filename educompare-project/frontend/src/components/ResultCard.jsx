import { Link } from 'react-router-dom'
import { useAppShell } from '../context/AppShellContext'
import { convertCurrency } from '../utils/currency'
import { isDeadlinePassed } from '../utils/date'

const MAX_SCORE = 75

const COUNTRY_NAMES = {
  C001: 'Taiwan',
  C002: 'Thailand',
  C003: 'Singapore',
}

const SCORE_LABELS = {
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

  return (
    <article className="result-card">
      <div className="result-card-header">
        <div>
          <p className="result-meta">{`${COUNTRY_NAMES[item.country_id] ?? item.country_id} • ${item.degree_level}`}</p>
          <h3>{item.major_name}</h3>
          <p className="muted-text">{item.university_name}</p>
        </div>
        <div className="score-badge">
          {item.score}
          <span className="score-max">/ {MAX_SCORE} pts</span>
        </div>
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
            {item.application_deadline ?? 'Not listed'}
            {deadlinePassed ? ' — Deadline passed' : ''}
          </dd>
        </div>
      </dl>

      <div className="score-breakdown">
        <p className="section-label">Match breakdown</p>
        <ul className="plain-list">
          {Object.entries(item.score_breakdown ?? {}).map(([key, value]) => (
            <li key={key}>
              <span>{SCORE_LABELS[key] ?? key.replace(/_/g, ' ')}</span>
              <strong className={value > 0 ? 'score-earned' : 'score-zero'}>
                {value > 0 ? `+${value}` : '—'}
              </strong>
            </li>
          ))}
        </ul>
      </div>

      <Link className="text-link" to={`/programs/${item.program_id}`}>
        View program detail
      </Link>
    </article>
  )
}

export default ResultCard
