import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Problemcontext } from '../../context/context'
import { getAnalytics } from '../../utils/analytics'

const Analysis = () => {
  const { problems } = useContext(Problemcontext)
  const analytics = getAnalytics(problems)
  const maxActivity = Math.max(...analytics.recentTrend.map((day) => day.count), 1)

  return (
    <div className="page-stack">
      <header className="page-header"><div><p className="eyebrow">YOUR PRACTICE DATA</p><h1>Performance analytics</h1><p className="page-subtitle">Understand your logged outcomes by topic, difficulty, and time.</p></div><Link className="button button-secondary" to="/practice"><i className="ti ti-plus" /> Log practice</Link></header>
      <div className="notice notice-info"><i className="ti ti-info-circle" /><p>Completion rate is calculated from problems marked Solved versus all logged records. Per-attempt accuracy and time taken are not stored, so they are not estimated.</p></div>
      <section className="content-grid content-grid-two">
        <article className="panel"><div className="panel-heading"><div><h2>Difficulty breakdown</h2><p>Logged problems marked solved at each level</p></div></div><div className="difficulty-list">{analytics.difficulty.map((item) => <div className="difficulty-row" key={item.name}><div className="difficulty-row-top"><strong>{item.name}</strong><span>{item.solved} solved <span className="muted-separator">/</span> {item.total} logged</span></div><div className="progress-track"><span className={`fill-${item.name.toLowerCase()}`} style={{ width: `${item.completionRate || 0}%` }} /></div><small>{item.completionRate === null ? 'No data yet' : `${item.completionRate}% completion rate`}</small></div>)}</div></article>
        <article className="panel"><div className="panel-heading"><div><h2>At a glance</h2><p>Signals supported by your current data</p></div></div><div className="snapshot-score"><strong>{analytics.completionRate === null ? '—' : `${analytics.completionRate}%`}</strong><span>logged problems marked solved</span></div><div className="snapshot-list"><div><span>Accuracy</span><strong>Not tracked</strong></div><div><span>Time per problem</span><strong>Not tracked</strong></div><div><span>Current practice streak</span><strong>{analytics.streak} days</strong></div></div></article>
      </section>
      <article className="panel">
        <div className="panel-heading"><div><h2>Topic performance</h2><p>Low solved counts alone are not treated as weakness.</p></div><Link className="text-link" to="/weak-topics">Review topic signals <i className="ti ti-arrow-right" /></Link></div>
        {analytics.topics.some((topic) => topic.records) ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Topic</th><th>Logged</th><th>Solved</th><th>Completion</th><th>Assessment</th></tr></thead><tbody>{analytics.topics.filter((topic) => topic.records).map((topic) => <tr key={topic.name}><td className="table-primary">{topic.name}</td><td>{topic.records}</td><td>{topic.solved}</td><td>{topic.completionRate}%</td><td><span className={`status-badge ${topic.status === 'Needs practice' ? 'status-review' : topic.status === 'Strong' ? 'status-solved' : 'status-neutral'}`}>{topic.status}</span></td></tr>)}</tbody></table></div> : <div className="empty-state compact-empty"><i className="ti ti-git-branch" /><strong>Topic analytics need practice history</strong><span>Log problem topics to see how outcomes differ by topic.</span></div>}
      </article>
      <article className="panel">
        <div className="panel-heading"><div><h2>30-day solving trend</h2><p>Problems marked solved per day</p></div><span className="quiet-badge">{analytics.recentTrend.reduce((sum, day) => sum + day.count, 0)} solved</span></div>
        {analytics.total ? <div className="trend-chart" role="img" aria-label="Solved problems per day during the last 30 days">{analytics.recentTrend.map((day, index) => <div className="trend-bar-wrap" key={`${day.label}-${index}`} title={`${day.label}: ${day.count} solved`}><span className="trend-bar" style={{ height: `${day.count ? Math.max(6, (day.count / maxActivity) * 100) : 2}%` }} /></div>)}</div> : <div className="empty-state compact-empty"><i className="ti ti-chart-line" /><strong>No trend data yet</strong><span>Once problems are logged, this chart will show recorded solved activity.</span></div>}
        <div className="trend-axis"><span>30 days ago</span><span>Today</span></div>
      </article>
    </div>
  )
}

export default Analysis
