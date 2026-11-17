import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function RequireAuth({ children }) {
  const { session, loading } = useAuth()

  if (loading) {
    return <main className="auth-loading"><span className="auth-spinner" />Checking your session…</main>
  }

  return session ? children : <Navigate to="/auth" replace />
}
