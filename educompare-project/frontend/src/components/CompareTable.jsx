function CompareTable({ rows }) {
  if (!rows.length) {
    return <p className="empty-state">Select two program IDs to compare them side by side.</p>
  }

  const [left, right] = rows

  const dataRows = [
    ['Program ID', left.program_id, right.program_id],
    ['Program', left.major_name, right.major_name],
    ['University', left.university, right.university],
    ['Degree', left.degree_level, right.degree_level],
    ['Language', left.instruction_language, right.instruction_language],
    ['Tuition / semester', left.tuition_fee, right.tuition_fee],
    ['Monthly living cost', left.living_cost, right.living_cost],
    ['Currency', left.currency, right.currency],
    ['Minimum GPA', left.min_gpa, right.min_gpa],
    ['Minimum IELTS', left.ielts_min, right.ielts_min],
    ['Deadline', left.application_deadline, right.application_deadline],
  ]

  return (
    <div className="table-shell">
      <table className="compare-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>{left.program_id}</th>
            <th>{right.program_id}</th>
          </tr>
        </thead>
        <tbody>
          {dataRows.map(([label, leftValue, rightValue]) => (
            <tr key={label}>
              <th>{label}</th>
              <td>{leftValue ?? 'Not available'}</td>
              <td>{rightValue ?? 'Not available'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CompareTable
