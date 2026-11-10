import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Problemcontext } from '../context/context'

const RecentProblems = () => {
  const { problems } = useContext(Problemcontext)
  const recent = [...problems].sort((first, second) => new Date(second.date || 0) - new Date(first.date || 0)).slice(0, 5)

  return (
    <article className="panel">
      <div className="panel-heading">
        <div><h2>Recent practice</h2><p>Your latest logged problems</p></div>
        <Link className="text-link" to="/practice">View history <i className="ti ti-arrow-right" /></Link>
      </div>
      {recent.length ? (
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Problem</th><th>Topic</th><th>Difficulty</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>{recent.map((problem) => (
              <tr key={problem.id}>
                <td className="table-primary">{problem.title}</td>
                <td>{(problem.tags || []).join(', ') || '—'}</td>
                <td><span className={`difficulty-badge difficulty-${String(problem.difficulty || '').toLowerCase()}`}>{problem.difficulty || '—'}</span></td>
                <td><span className={`status-badge status-${String(problem.status || '').toLowerCase()}`}>{problem.status || '—'}</span></td>
                <td>{problem.date ? new Date(problem.date).toLocaleDateString() : '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state"><i className="ti ti-code" /><strong>Your practice history is empty</strong><span>Log your first problem to unlock personalized insights from your history.</span><Link className="button button-secondary" to="/practice">Go to My Practice</Link></div>
      )}
    </article>
  )
}

export default RecentProblems
