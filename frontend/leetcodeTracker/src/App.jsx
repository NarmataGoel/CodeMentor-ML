import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import RequireAuth from './auth/RequireAuth'
import Analysis from './components1/components/Analysis'
import AuthPage from './components1/components/AuthPage'
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

function AppContent() {
  const { session, loading } = useAuth()
  const userId = session?.user?.id ?? null
  const [problems, setProblems] = useState([])
  const [goals, setGoals] = useState([])
  const [goalsUserId, setGoalsUserId] = useState(null)

  useEffect(() => {
    let active = true
    setProblems([])
    setGoalsUserId(null)
    setGoals(userId ? (() => {
      const stored = readStorage(`learning-goals:${userId}`, [])
      return Array.isArray(stored) ? stored : []
    })() : [])
    if (userId) setGoalsUserId(userId)

    if (!userId) return () => { active = false }

    getProblems().then((data) => {
      if (active) setProblems(data)
    }).catch((error) => {
      console.error('Unable to load problems from MongoDB:', error)
    })

    return () => { active = false }
  }, [userId])

  useEffect(() => {
    if (userId && goalsUserId === userId) {
      localStorage.setItem(`learning-goals:${userId}`, JSON.stringify(goals))
    }
  }, [goals, userId, goalsUserId])

  const tracker = useMemo(() => ({ problems, setProblems, goals, setGoals }), [problems, goals])

  return (
    <Problemcontext.Provider value={tracker}>
      <Routes>
        <Route path="auth" element={<AuthPage />} />
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
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
        <Route path="*" element={<Navigate to={loading ? '/auth' : session ? '/' : '/auth'} replace />} />
      </Routes>
    </Problemcontext.Provider>
  )
}

function App() {
  return <AuthProvider><AppContent /></AuthProvider>
}

export default App
