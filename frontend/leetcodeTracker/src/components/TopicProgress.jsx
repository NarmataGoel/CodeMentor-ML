import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Problemcontext } from '../context/context'
import { getAnalytics } from '../utils/analytics'

const TopicProgress = () => {
  const { problems } = useContext(Problemcontext)
  const topics = getAnalytics(problems).topics
    .filter((topic) => topic.records)
    .slice(0, 6)

  return (
    <article className="panel">
      <div className="panel-heading">
        <div><h2>Topic progress</h2><p>Completion across topics in your history</p></div>
        <Link className="text-link" to="/analytics">All topics <i className="ti ti-arrow-right" /></Link>
      </div>
      {topics.length ? (
        <div className="topic-list">
          {topics.map((topic) => (
            <div className="topic-row" key={topic.name}>
              <div className="topic-row-label"><strong>{topic.name}</strong><span>{topic.solved}/{topic.records} solved</span></div>
              <div className="progress-track"><span style={{ width: `${topic.completionRate}%` }} /></div>
              <span className="topic-percent">{topic.completionRate}%</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state compact-empty"><i className="ti ti-git-branch" /><strong>No topic data yet</strong><span>Add a topic when logging a problem to see progress here.</span></div>
      )}
    </article>
  )
}

export default TopicProgress
