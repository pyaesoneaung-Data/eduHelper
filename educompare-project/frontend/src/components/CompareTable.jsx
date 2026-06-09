import { Link } from 'react-router-dom'
import { ArrowsLeftRight } from '@phosphor-icons/react'
import { useAppShell } from '../context/AppShellContext'
import { convertCurrency } from '../utils/currency'
import { formatDate, isDeadlinePassed } from '../utils/date'

function formatCost(value, nativeCurrency, displayCurrency) {
  if (value === null || value === undefined) return 'Not available'
  const isUSD = displayCurrency === 'USD'
  const amount = isUSD ? convertCurrency(Number(value), nativeCurrency, 'USD') : Number(value)
  const label = isUSD ? 'USD' : (nativeCurrency ?? '')
  return `${Math.round(amount).toLocaleString()} ${label}`.trim()
}

function CompareTable({ rows }) {
  const { currency: displayCurrency, toggleCurrency } = useAppShell()

  if (!rows.length) {
    return (
      <div className="hub-pre-result">
        <ArrowsLeftRight size={56} aria-hidden="true" />
        <p>Select two programs above to compare them side by side.</p>
      </div>
    )
  }

  const [left, right] = rows
  const hasMixedCurrencies = left.currency !== right.currency && displayCurrency === 'native'
  const leftDeadlinePassed = isDeadlinePassed(left.application_deadline)
  const rightDeadlinePassed = isDeadlinePassed(right.application_deadline)

  const dataRows = [
    { label: 'University',          left: left.university,                                                        right: right.university },
    { label: 'Degree',              left: left.degree_level,                                                      right: right.degree_level },
    { label: 'Language',            left: left.instruction_language,                                              right: right.instruction_language },
    { label: 'Tuition / semester',  left: formatCost(left.tuition_fee, left.currency, displayCurrency),          right: formatCost(right.tuition_fee, right.currency, displayCurrency) },
    { label: 'Monthly living cost', left: formatCost(left.living_cost, left.currency, displayCurrency),          right: formatCost(right.living_cost, right.currency, displayCurrency) },
    { label: 'Minimum GPA',         left: left.min_gpa ?? 'Not listed',                                          right: right.min_gpa ?? 'Not listed' },
    { label: 'Minimum IELTS',       left: left.ielts_min ?? 'Not listed',                                        right: right.ielts_min ?? 'Not listed' },
  ]

  return (
    <>
      {hasMixedCurrencies ? (
        <p className="muted-text">
          These programs use different currencies ({left.currency} / {right.currency}) — cost figures are not directly comparable.{' '}
          <button type="button" className="text-button" onClick={toggleCurrency}>
            Switch to USD for a fair comparison →
          </button>
        </p>
      ) : null}

      <div className="table-shell">
        <table className="compare-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>
                <Link to={`/programs/${left.program_id}`} className="text-link">
                  {left.major_name}
                </Link>
                <span className="compare-table-uni">{left.university}</span>
              </th>
              <th>
                <Link to={`/programs/${right.program_id}`} className="text-link">
                  {right.major_name}
                </Link>
                <span className="compare-table-uni">{right.university}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row) => (
              <tr key={row.label}>
                <th>{row.label}</th>
                <td>{row.left ?? 'Not available'}</td>
                <td>{row.right ?? 'Not available'}</td>
              </tr>
            ))}

            <tr>
              <th>Deadline</th>
              <td className={leftDeadlinePassed ? 'deadline-passed' : ''}>
                {formatDate(left.application_deadline) ?? 'Not listed'}
                {leftDeadlinePassed ? ' — Deadline passed' : ''}
              </td>
              <td className={rightDeadlinePassed ? 'deadline-passed' : ''}>
                {formatDate(right.application_deadline) ?? 'Not listed'}
                {rightDeadlinePassed ? ' — Deadline passed' : ''}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}

export default CompareTable
