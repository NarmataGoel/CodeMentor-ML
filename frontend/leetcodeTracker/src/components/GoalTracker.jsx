import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Problemcontext } from '../context/context'
import { getAnalytics, getGoalProgress } from '../utils/analytics'

const GoalTracker = () => {
  const { problems, goals } = useContext(Problemcontext)
  const analytics = getAnalytics(problems)
  const defaultGoals = [
    { id: 'weekly', title: 'Solve 5 problems this week', target: 5, type: 'weekly', icon: 'ti ti-calendar-week' },
    { id: 'dp', title: 'Practice Dynamic Programming', target: 50, type: 'topic', topic: 'Dynamic Programming', icon: 'ti ti-brain' },
    { id: 'medium', title: 'Complete 100 Medium problems', target: 100, type: 'difficulty', difficulty: 'Medium', icon: 'ti ti-trophy' },
  ]
  const items = [...defaultGoals, ...goals].slice(0, 4)

  return (
    <article className="panel">
      <div className="panel-heading">
        <div><h2>Learning goals</h2><p>Small, measurable steps toward consistency</p></div>
        <Link className="text-link" to="/goals">Manage goals <i className="ti ti-arrow-right" /></Link>
      </div>
      {items.length ? (
        <div className="goal-list">
          {items.map((goal) => {
            const current = getGoalProgress(goal, problems, analytics)
            const percent = Math.min(Math.round((current / goal.target) * 100), 100)
            return (
              <div className="goal-item" key={goal.id}>
                <div className="goal-icon"><i className={goal.icon || 'ti ti-target'} /></div>
                <div className="goal-main"><div className="goal-title-row"><strong>{goal.title}</strong><span>{current}/{goal.target}</span></div><div className="progress-track"><span style={{ width: `${percent}%` }} /></div></div>
              </div>
            )
          })}
        </div>
      ) : <p className="muted-copy">Create a learning goal to get started.</p>}
    </article>
  )
}

export default GoalTracker
