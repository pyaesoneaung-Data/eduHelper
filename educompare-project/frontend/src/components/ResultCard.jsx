import { Link } from 'react-router-dom'

function ResultCard({ item }) {
  return (
    <article className="result-card">
      <div className="result-card-header">
        <div>
          <p className="result-meta">{item.country_id} • {item.degree_level}</p>
          <h3>{item.major_name}</h3>
          <p className="muted-text">{item.university_name}</p>
        </div>
        <div className="score-badge">{item.score}</div>
      </div>

      <dl className="detail-grid compact">
        <div>
          <dt>Language</dt>
          <dd>{item.instruction_language}</dd>
        </div>
        <div>
          <dt>Estimated yearly cost</dt>
          <dd>{item.estimated_yearly_cost} {item.currency}</dd>
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
          <dd>{item.application_deadline ?? 'Not listed'}</dd>
        </div>
      </dl>

      <div className="score-breakdown">
        <p className="section-label">Score breakdown</p>
        <ul className="plain-list">
          {Object.entries(item.score_breakdown ?? {}).map(([key, value]) => (
            <li key={key}>
              <span>{key.replace('_', ' ')}</span>
              <strong>{value}</strong>
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
