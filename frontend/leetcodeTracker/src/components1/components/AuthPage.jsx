import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { supabase } from '../../lib/supabase'

export default function AuthPage() {
  const { session, loading: sessionLoading } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  if (sessionLoading) return <main className="auth-loading">Checking your session…</main>
  if (session) return <Navigate to="/" replace />

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        })
        if (authError) throw authError
        if (!data.session) setMessage('Check your email and confirm your account, then sign in here.')
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (authError) throw authError
      }
    } catch (authError) {
      setError(authError.message || 'Unable to authenticate. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand-mark"><i className="ti ti-brain" /></div>
        <p className="eyebrow">CODEMENTOR · DSA LEARNING</p>
        <h1>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
        <p className="auth-copy">Sign in to keep your practice history private and synced to your account.</p>

        <div className="auth-tabs" role="tablist" aria-label="Account action">
          <button type="button" role="tab" aria-selected={mode === 'signin'} className={mode === 'signin' ? 'selected' : ''} onClick={() => { setMode('signin'); setError(''); setMessage('') }}>Sign in</button>
          <button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'selected' : ''} onClick={() => { setMode('signup'); setError(''); setMessage('') }}>Create account</button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <label>Email<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
          <label>Password<input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}
          <button className="button button-primary auth-submit" disabled={busy} type="submit">{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'} <i className="ti ti-arrow-right" /></button>
        </form>
        <p className="auth-footnote">Your practice history is attached to your account.</p>
      </section>
    </main>
  )
}
