import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Analysis from './components1/components/Analysis'
import Goal from './components1/components/Goal'
import Home from './components1/components/Home'
import Layout from './components1/components/Layout'
import Problems from './components1/components/Problems'
import Profile from './components1/components/Profile'
import Recommendations from './components1/components/Recommendations'
import WeakTopics from './components1/components/WeakTopics'
import { Problemcontext } from './context/context'
import Progress from './components1/components/Progress'
import { getProblems } from './services/mlService'


function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch (error) {
    console.error(`Unable to read ${key} from local storage.`, error)
    return fallback
  }
}

function App() {
   const [problems, setProblems] = useState([])
  const [goals, setGoals] = useState(() => {
    const stored = readStorage('learning-goals', [])
    return Array.isArray(stored) ? stored : []
  })

  

  useEffect(() => {
    localStorage.setItem('learning-goals', JSON.stringify(goals))
  }, [goals])

  const tracker = useMemo(
    () => ({ problems, setProblems, goals, setGoals }),
    [problems, goals],
  )

  useEffect(() => {
  const loadProblems = async () => {
    try {
      const data = await getProblems('demo-user')
      setProblems(data)
    } catch (error) {
      console.error('Unable to load problems from MongoDB:', error)
    }
  }

  loadProblems()
}, [])

  return (
    <Problemcontext.Provider value={tracker}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="practice" element={<Problems />} />
          <Route path="analytics" element={<Analysis />} />
          <Route path="weak-topics" element={<WeakTopics />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="goals" element={<Goal />} />
          <Route path="profile" element={<Profile />} />
          <Route path="progress" element={<Progress />} />
          <Route path="problems" element={<Navigate to="/practice" replace />} />
          <Route path="goal" element={<Navigate to="/goals" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Problemcontext.Provider>
  )
}

export default App
