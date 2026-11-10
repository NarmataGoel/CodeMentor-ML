import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Problemcontext } from '../../context/context'
import { getAnalytics } from '../../utils/analytics'

const Profile = () => {
  const { problems } = useContext(Problemcontext)
  const analytics = getAnalytics(problems)
  const strongest = analytics.topics.filter((topic) => topic.status === 'Strong').slice(0, 3)
  const needsPractice = analytics.topics.filter((topic) => topic.status === 'Needs practice').slice(0, 3)
  const proficiency = analytics.completionRate === null ? 'Not enough data' : analytics.completionRate >= 80 ? 'Building strong habits' : analytics.completionRate >= 50 ? 'Making progress' : 'Early learning stage'

  return (
    <div className="page-stack">
      <header className="page-header"><div><p className="eyebrow">YOUR LEARNING SNAPSHOT</p><h1>My skill profile</h1><p className="page-subtitle">A summary of what your current saved practice history can—and cannot—tell you.</p></div><Link className="button button-secondary" to="/practice"><i className="ti ti-plus" /> Add history</Link></header>
      <div className="profile-hero panel"><div className="profile-avatar"><i className="ti ti-user" /></div><div><span className="eyebrow">DSA LEARNER</span><h2>{proficiency}</h2><p>{analytics.solved} problems marked solved across {analytics.topics.filter((topic) => topic.records).length} practiced topics.</p></div></div>
      <section className="stat-grid profile-stat-grid">
        <article className="stat-card tone-green"><span>Easy solved</span><strong className="stat-value">{analytics.difficulty[0].solved}</strong><small>{analytics.difficulty[0].completionRate ?? '—'}% completion of logged Easy</small></article>
        <article className="stat-card tone-orange"><span>Medium solved</span><strong className="stat-value">{analytics.difficulty[1].solved}</strong><small>{analytics.difficulty[1].completionRate ?? '—'}% completion of logged Medium</small></article>
        <article className="stat-card tone-red"><span>Hard solved</span><strong className="stat-value">{analytics.difficulty[2].solved}</strong><small>{analytics.difficulty[2].completionRate ?? '—'}% completion of logged Hard</small></article>
        <article className="stat-card tone-blue"><span>Practice consistency</span><strong className="stat-value">{analytics.activeDays}/30</strong><small>Active days in the last 30 days</small></article>
      </section>
      <section className="content-grid content-grid-two">
        <article className="panel"><div className="panel-heading"><div><h2>Strongest topics</h2><p>At least 2 records and ≥80% marked solved</p></div></div>{strongest.length ? <div className="profile-topic-list">{strongest.map((topic) => <div key={topic.name}><span>{topic.name}</span><strong>{topic.completionRate}%</strong></div>)}</div> : <p className="muted-copy">No topics meet the current evidence threshold yet.</p>}</article>
        <article className="panel"><div className="panel-heading"><div><h2>Topics to revisit</h2><p>Based on unsolved and repeated-attempt records</p></div></div>{needsPractice.length ? <div className="profile-topic-list">{needsPractice.map((topic) => <div key={topic.name}><span>{topic.name}</span><strong>{topic.unsolved} unsolved</strong></div>)}</div> : <p className="muted-copy">No topics currently meet the extra-practice signal.</p>}</article>
      </section>
      <article className="panel profile-next-step"><div><span className="eyebrow">SUGGESTED NEXT LEARNING GOAL</span><h2>{needsPractice.length ? `Revisit ${needsPractice[0].name}` : analytics.solved ? 'Build consistent weekly practice' : 'Log your first practice problem'}</h2><p>{needsPractice.length ? needsPractice[0].reasons[0] || 'Add more practice history to clarify the pattern.' : 'A steady record helps reveal real trends without guessing at your performance.'}</p></div><Link className="button button-primary" to={needsPractice.length ? '/recommendations' : '/goals'}>{needsPractice.length ? 'See suggestions' : 'Set a goal'} <i className="ti ti-arrow-right" /></Link></article>
      <div className="notice notice-info"><i className="ti ti-info-circle" /><p>Overall accuracy, time taken, and per-attempt history are not available in the current data model, so this profile reports logged completion and practice consistency instead.</p></div>
    </div>
  )
}

export default Profile
