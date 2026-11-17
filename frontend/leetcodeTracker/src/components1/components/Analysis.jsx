import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Problemcontext } from '../../context/context'
import { getAnalytics } from '../../utils/analytics'

const Analysis = () => {
  const { problems } = useContext(Problemcontext)
  const analytics = getAnalytics(problems)
  const maxActivity = Math.max(...analytics.recentTrend.map((day) => day.count), 1)
  const completionRate = analytics.completionRate ?? 0
  const solvedIn30Days = analytics.recentTrend.reduce((sum, day) => sum + day.count, 0)

  return (
    <div className="page-stack analytics-page">
      <header className="page-header analytics-page-header">
        <div>
          <p className="eyebrow">YOUR PRACTICE DATA</p>
          <h1>Performance analytics</h1>
          <p className="page-subtitle">A clear picture of what you’ve solved, what you’re practicing, and how your rhythm is changing.</p>
        </div>
        <Link className="button button-primary" to="/practice"><i className="ti ti-plus" /> Log practice</Link>
      </header>

      <section className="analytics-metrics" aria-label="Practice overview">
        <article className="analytics-metric"><span><i className="ti ti-stack-2" /> Problems logged</span><strong>{analytics.total}</strong><small>Across all difficulty levels</small></article>
        <article className="analytics-metric metric-lime"><span><i className="ti ti-circle-check" /> Problems solved</span><strong>{analytics.solved}</strong><small>{analytics.unsolved} still in progress or review</small></article>
        <article className="analytics-metric metric-violet"><span><i className="ti ti-calendar-stats" /> Current streak</span><strong>{analytics.streak}<small> days</small></strong><small>Consecutive days with practice</small></article>
      </section>

      <section className="analytics-overview-grid">
        <article className="panel analytics-difficulty-panel">
          <div className="panel-heading"><div><h2>Difficulty breakdown</h2><p>Completion rate within each level</p></div><span className="quiet-badge">{analytics.total} total</span></div>
          <div className="difficulty-cards">
            {analytics.difficulty.map((item) => (
              <div className={`difficulty-card difficulty-card-${item.name.toLowerCase()}`} key={item.name}>
                <span>{item.name}</span>
                <strong>{item.solved}<small>/{item.total}</small></strong>
                <div className="progress-track"><span style={{ width: `${item.completionRate || 0}%` }} /></div>
                <small>{item.completionRate === null ? 'No data yet' : `${item.completionRate}% solved`}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="panel analytics-completion-panel">
          <div className="panel-heading"><div><h2>Overall completion</h2><p>Solved problems divided by all logged records</p></div></div>
          <div className="completion-content">
            <div className="completion-ring" style={{ '--completion': `${completionRate}%` }} aria-label={`${completionRate}% completion`}>
              <div><strong>{analytics.completionRate === null ? '—' : `${completionRate}%`}</strong><span>completion</span></div>
            </div>
            <div className="completion-facts">
              <div><span>Solved</span><strong>{analytics.solved}</strong></div>
              <div><span>Not solved yet</span><strong>{analytics.unsolved}</strong></div>
              <div><span>Active days this month</span><strong>{analytics.activeDays}</strong></div>
            </div>
          </div>
        </article>
      </section>

      <article className="panel analytics-trend-panel">
        <div className="panel-heading"><div><h2>Solving rhythm</h2><p>Problems marked solved each day over the last 30 days</p></div><span className="quiet-badge">{solvedIn30Days} solved this month</span></div>
        {analytics.total ? (
          <>
            <div className="trend-chart analytics-trend-chart" role="img" aria-label="Solved problems per day during the last 30 days">
              {analytics.recentTrend.map((day, index) => (
                <div className={`trend-bar-wrap${day.count ? ' has-activity' : ''}`} key={`${day.label}-${index}`} title={`${day.label}: ${day.count} solved`}>
                  <span className="trend-bar" style={{ height: `${day.count ? Math.max(7, (day.count / maxActivity) * 100) : 2}%` }} />
                </div>
              ))}
            </div>
            <div className="trend-axis"><span>30 days ago</span><span>Today</span></div>
          </>
        ) : <div className="empty-state compact-empty"><i className="ti ti-chart-line" /><strong>No trend data yet</strong><span>Once you log solved problems, this chart will show your daily activity.</span></div>}
      </article>

      <article className="panel analytics-topic-panel">
        <div className="panel-heading"><div><h2>Topic performance</h2><p>Compare outcomes across the topics you’ve practiced.</p></div><Link className="text-link" to="/weak-topics">Explore topic signals <i className="ti ti-arrow-right" /></Link></div>
        {analytics.topics.some((topic) => topic.records) ? (
          <div className="table-scroll"><table className="data-table"><thead><tr><th>Topic</th><th>Logged</th><th>Solved</th><th>Completion</th><th>Assessment</th></tr></thead><tbody>
            {analytics.topics.filter((topic) => topic.records).map((topic) => (
              <tr key={topic.name}><td className="table-primary">{topic.name}</td><td>{topic.records}</td><td>{topic.solved}</td><td><span className="table-completion">{topic.completionRate}%</span></td><td><span className={`status-badge ${topic.status === 'Needs practice' ? 'status-review' : topic.status === 'Strong' ? 'status-solved' : 'status-neutral'}`}>{topic.status}</span></td></tr>
            ))}
          </tbody></table></div>
        ) : <div className="empty-state compact-empty"><i className="ti ti-git-branch" /><strong>Topic analytics need practice history</strong><span>Add topics when logging problems to compare outcomes here.</span></div>}
      </article>

      <p className="footnote analytics-footnote"><i className="ti ti-info-circle" /> Completion is based on logged statuses. Attempt-level accuracy and time taken are not stored, so they are not estimated.</p>
    </div>
  )
}

export default Analysis
