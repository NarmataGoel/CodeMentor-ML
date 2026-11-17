import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { getAnalytics } from '../utils/analytics'
import { Problemcontext } from '../context/context'

const Dashboard = () => {
  const { problems } = useContext(Problemcontext)
  const analytics = getAnalytics(problems)
  const stats = [
    { label: 'Problems solved', value: analytics.solved, icon: 'ti ti-circle-check', tone: 'green', hint: `${analytics.total} problems logged`, to: '/practice' },
    { label: 'Completion rate', value: analytics.completionRate === null ? '—' : `${analytics.completionRate}%`, icon: 'ti ti-chart-donut-3', tone: 'purple', hint: 'Solved out of all logged problems', to: '/analytics' },
    { label: 'Practice streak', value: `${analytics.streak} ${analytics.streak === 1 ? 'day' : 'days'}`, icon: 'ti ti-calendar-stats', tone: 'blue', hint: 'Consecutive active days', to: '/analytics' },
    { label: 'Active days', value: analytics.activeDays, icon: 'ti ti-calendar-check', tone: 'orange', hint: 'In the last 30 days', to: '/analytics' },
  ]

  return (
    <>
      <header className="page-header dashboard-hero">
        <div>
          <p className="eyebrow">YOUR DSA JOURNEY · {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1>Small steps. <span>Big progress.</span></h1>
          <p className="page-subtitle">Your practice is adding up. Keep going.</p>
        </div>
        <Link className="button button-primary" to="/practice"><i className="ti ti-plus" /> Log practice</Link>
      </header>

      <div className="notice notice-info">
        <i className="ti ti-info-circle" />
        <p><strong>Practice snapshot.</strong> Metrics are based on your saved problem history.</p>
        <Link to="/recommendations">See suggestions <i className="ti ti-arrow-up-right" /></Link>
      </div>

      <section className="stat-grid" aria-label="Practice summary">
        {stats.map((item) => (
          <Link className={`stat-card tone-${item.tone}`} key={item.label} to={item.to} aria-label={`View ${item.label.toLowerCase()} details`}>
            <div className="stat-card-top">
              <span>{item.label}</span>
              <i className={item.icon} aria-hidden="true" />
            </div>
            <strong className="stat-value">{item.value}</strong>
            <small>{item.hint}</small>
            <i className="ti ti-arrow-up-right stat-card-arrow" aria-hidden="true" />
          </Link>
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
                <div className="activity-column" key={day.label + day.date.toISOString()} title={`${day.label}: ${day.count} ${day.count === 1 ? 'problem' : 'problems'} solved`}>
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
