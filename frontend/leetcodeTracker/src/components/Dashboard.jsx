import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { getAnalytics } from '../utils/analytics'
import { Problemcontext } from '../context/context'
import { getMlServiceStatus } from '../services/mlService'

const Dashboard = () => {
  const { problems } = useContext(Problemcontext)
  const analytics = getAnalytics(problems)
  const mlStatus = getMlServiceStatus()
  const stats = [
    { label: 'Problems solved', value: analytics.solved, icon: 'ti ti-circle-check', tone: 'green', hint: `${analytics.total} logged in total` },
    ...analytics.difficulty.map((item) => ({
      label: `${item.name} solved`,
      value: item.solved,
      icon: item.name === 'Easy' ? 'ti ti-leaf' : item.name === 'Medium' ? 'ti ti-flame' : 'ti ti-bolt',
      tone: item.name.toLowerCase(),
      hint: item.total ? `${item.completionRate}% completion of logged ${item.name.toLowerCase()}` : 'No problems logged yet',
    })),
    { label: 'Practice streak', value: `${analytics.streak} ${analytics.streak === 1 ? 'day' : 'days'}`, icon: 'ti ti-calendar-stats', tone: 'blue', hint: 'Based on days with logged practice' },
    { label: 'Accuracy', value: 'Not tracked', icon: 'ti ti-target', tone: 'purple', hint: 'Per-attempt outcomes are not stored' },
  ]

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1>Your learning dashboard</h1>
          <p className="page-subtitle">A clear view of your practice, progress, and what to revisit next.</p>
        </div>
        <Link className="button button-primary" to="/practice"><i className="ti ti-plus" /> Log practice</Link>
      </header>

      <div className="notice notice-info">
        <i className="ti ti-info-circle" />
        <p><strong>History-based insights.</strong> {mlStatus.message} Metrics and practice suggestions on this page are derived from your saved history, not AI or ML predictions.</p>
        <Link to="/recommendations">See suggestions <i className="ti ti-arrow-up-right" /></Link>
      </div>

      <section className="stat-grid" aria-label="Practice summary">
        {stats.map((item) => (
          <article className={`stat-card tone-${item.tone}`} key={item.label}>
            <div className="stat-card-top">
              <span>{item.label}</span>
              <i className={item.icon} aria-hidden="true" />
            </div>
            <strong className={item.value === 'Not tracked' ? 'stat-value stat-value-muted' : 'stat-value'}>{item.value}</strong>
            <small>{item.hint}</small>
          </article>
        ))}
      </section>

      <section className="content-grid content-grid-two dashboard-grid">
        <article className="panel">
          <div className="panel-heading">
            <div><h2>Weekly activity</h2><p>Problems marked solved over the last 7 days</p></div>
            <span className="quiet-badge">This week</span>
          </div>
          {analytics.total ? (
            <div className="activity-chart" role="img" aria-label="Solved problems per day this week">
              {analytics.weeklyActivity.map((day) => (
                <div className="activity-column" key={day.label + day.date.toISOString()}>
                  <span className="activity-count">{day.count || ''}</span>
                  <div className="activity-track">
                    <span style={{ height: `${day.count ? Math.max(12, Math.min(day.count * 22, 100)) : 3}%` }} />
                  </div>
                  <small>{day.label}</small>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state compact-empty"><i className="ti ti-chart-bar" /><strong>Your activity will appear here</strong><span>Log a solved problem to start tracking your week.</span></div>
          )}
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div><h2>Performance snapshot</h2><p>Completion rate is based on logged problem statuses</p></div>
            <Link to="/analytics" className="text-link">View analytics <i className="ti ti-arrow-right" /></Link>
          </div>
          <div className="snapshot-score">
            <strong>{analytics.completionRate === null ? '—' : `${analytics.completionRate}%`}</strong>
            <span>logged problems marked solved</span>
          </div>
          <div className="snapshot-list">
            <div><span>Active practice days · last 30 days</span><strong>{analytics.activeDays}</strong></div>
            <div><span>Unsolved / in review</span><strong>{analytics.unsolved}</strong></div>
            <div><span>Topics with enough history</span><strong>{analytics.topics.filter((topic) => topic.records >= 2).length}</strong></div>
          </div>
        </article>
      </section>
    </>
  )
}

export default Dashboard
