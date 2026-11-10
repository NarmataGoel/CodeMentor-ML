const ProblemTable = ({ problems = [], deleteProblem, handleEdit }) => (
  <div className="table-scroll">
    <table className="data-table">
      <thead><tr><th>Problem</th><th>Topic</th><th>Difficulty</th><th>Status</th><th>Attempts</th><th>Date solved</th><th><span className="sr-only">Actions</span></th></tr></thead>
      <tbody>{problems.map((problem) => (
        <tr key={problem.id}>
          <td className="table-primary">{problem.title}</td>
          <td>{(problem.tags || []).join(', ') || '—'}</td>
          <td><span className={`difficulty-badge difficulty-${String(problem.difficulty || '').toLowerCase()}`}>{problem.difficulty || '—'}</span></td>
          <td><span className={`status-badge status-${String(problem.status || '').toLowerCase()}`}>{problem.status || '—'}</span></td>
          <td>{problem.attempts || '—'}</td>
          <td>{problem.status === 'Solved' && problem.date ? new Date(problem.date).toLocaleDateString() : '—'}</td>
          <td className="action-cell"><button className="icon-button" aria-label={`Edit ${problem.title}`} onClick={() => handleEdit(problem)}><i className="ti ti-edit" /></button><button className="icon-button danger-button" aria-label={`Delete ${problem.title}`} onClick={() => deleteProblem(problem.id)}><i className="ti ti-trash" /></button></td>
        </tr>
      ))}</tbody>
    </table>
  </div>
)

export default ProblemTable
