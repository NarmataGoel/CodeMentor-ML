import Dashboard from '../../components/Dashboard'
import GoalTracker from '../../components/GoalTracker'
import TopicProgress from '../../components/TopicProgress'
import RecentProblems from '../../components/RecentProblems'

const Home = () => {
  return (
    <div className="page-stack">
      <Dashboard />
      <div className="content-grid content-grid-two">
        <TopicProgress />
        <GoalTracker />
      </div>
      <RecentProblems />
    </div>
  )
}

export default Home
