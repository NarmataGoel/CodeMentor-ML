import { useContext, useState } from 'react'
import { Problemcontext } from '../../context/context'
import { getAnalytics, getGoalProgress, TOPICS } from '../../utils/analytics'

const Goal = () => {
  const { problems, goals, setGoals } = useContext(Problemcontext)
  const [title, setTitle] = useState('')
  const [type, setType] = useState('weekly')
  const [target, setTarget] = useState(5)
  const [topic, setTopic] = useState(TOPICS[0])
  const [difficulty, setDifficulty] = useState('Medium')
  const analytics = getAnalytics(problems)
  const presets = [
    { id: 'weekly', title: 'Solve 5 problems this week', target: 5, type: 'weekly', icon: 'ti ti-calendar-week' },
    { id: 'dp', title: 'Practice Dynamic Programming', target: 50, type: 'topic', topic: 'Dynamic Programming', icon: 'ti ti-brain' },
    { id: 'medium', title: 'Complete 100 Medium problems', target: 100, type: 'difficulty', difficulty: 'Medium', icon: 'ti ti-trophy' },
  ]
  const allGoals = [...presets, ...goals]
  const addGoal = (event) => {
    event.preventDefault()
    if (!title.trim() || Number(target) < 1) return
    const newGoal = {
      id: `goal-${Date.now()}`, title: title.trim(), target: Number(target), type,
      icon: 'ti ti-target',
      ...(type === 'topic' ? { topic } : {}),
      ...(type === 'difficulty' ? { difficulty } : {}),
    }
    setGoals((current) => [...current, newGoal])
    setTitle('')
  }

  return (
    <div className="page-stack">
      <header className="page-header"><div><p className="eyebrow">KEEP YOUR MOMENTUM</p><h1>Learning goals</h1><p className="page-subtitle">Turn your practice into steady, trackable progress.</p></div></header>
      <section className="goal-page-list">
        {allGoals.map((goal) => {
          const current = getGoalProgress(goal, problems, analytics)
          const progress = Math.min(Math.round(current / goal.target * 100), 100)
          const custom = goals.some((item) => item.id === goal.id)
          return (
            <article className="panel goal-page-card" key={goal.id}>
              <div className="goal-icon"><i className={goal.icon || 'ti ti-target'} /></div>
              <div className="goal-main">
                <div className="goal-title-row"><div><h2>{goal.title}</h2><p>{goal.type === 'weekly' ? 'Solved this week' : goal.type === 'topic' ? `${goal.topic} · solved` : `${goal.difficulty} · solved`}</p></div><strong>{current}<span> / {goal.target}</span></strong></div>
                <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
                <small className="goal-progress-caption">{progress}% complete</small>
              </div>
              {custom && <button className="icon-button danger-button" aria-label={`Delete ${goal.title}`} onClick={() => setGoals((currentGoals) => currentGoals.filter((item) => item.id !== goal.id))}><i className="ti ti-trash" /></button>}
            </article>
          )
        })}
      </section>
      <section className="panel">
        <div className="panel-heading"><div><h2>Create a learning goal</h2><p>Choose what you want to measure and set a target.</p></div></div>
        <form className="goal-form" onSubmit={addGoal}>
          <label>Goal name<input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Practice graphs every day" /></label>
          <label>Measure<select value={type} onChange={(event) => setType(event.target.value)}><option value="weekly">Problems solved this week</option><option value="topic">Solved problems by topic</option><option value="difficulty">Solved problems by difficulty</option><option value="total">Total solved problems</option></select></label>
          {type === 'topic' && <label>Topic<select value={topic} onChange={(event) => setTopic(event.target.value)}>{TOPICS.map((item) => <option key={item}>{item}</option>)}</select></label>}
          {type === 'difficulty' && <label>Difficulty<select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option>Easy</option><option>Medium</option><option>Hard</option></select></label>}
          <label>Target<input type="number" min="1" required value={target} onChange={(event) => setTarget(event.target.value)} /></label>
          <button className="button button-primary" type="submit"><i className="ti ti-plus" /> Create goal</button>
        </form>
      </section>
      <p className="footnote">Progress counts solved entries in your local practice history. The weekly goal uses the last 7 calendar days.</p>
    </div>
  )
}

export default Goal
