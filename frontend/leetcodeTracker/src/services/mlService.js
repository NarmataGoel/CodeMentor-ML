import { supabase } from '../lib/supabase'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

async function authenticatedFetch(path, options = {}) {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  if (!session?.access_token) throw new Error('Please sign in to continue.')

  const headers = new Headers(options.headers || {})
  headers.set('Authorization', `Bearer ${session.access_token}`)
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  if (!response.ok) {
    const detail = await response.json().catch(() => null)
    throw new Error(detail?.detail || `Request failed (${response.status})`)
  }
  return response
}

export async function getMlServiceStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    if (!response.ok) throw new Error('Backend is not healthy')
    const data = await response.json()
    return { connected: true, message: data.status === 'healthy' ? 'FastAPI backend is connected' : 'FastAPI is running' }
  } catch {
    return { connected: false, message: 'Unable to connect to FastAPI backend' }
  }
}

export async function predictSuccess(features) {
  const response = await authenticatedFetch('/predict', {
    method: 'POST',
    body: JSON.stringify(features),
  })
  return response.json()
}

export async function predictStudentProblem(problemTitle) {
  const response = await authenticatedFetch('/predict/problem', {
    method: 'POST',
    body: JSON.stringify({ problemTitle }),
  })
  return response.json()
}

export async function createProblem(problem) {
  const response = await authenticatedFetch('/problems', {
    method: 'POST',
    body: JSON.stringify(problem),
  })
  return response.json()
}

export async function getProblems() {
  const response = await authenticatedFetch('/problems')
  return response.json()
}

export async function updateProblem(problemId, problem) {
  const response = await authenticatedFetch(`/problems/${encodeURIComponent(problemId)}`, {
    method: 'PUT',
    body: JSON.stringify(problem),
  })
  return response.json()
}

export async function deleteProblem(problemId) {
  const response = await authenticatedFetch(`/problems/${encodeURIComponent(problemId)}`, { method: 'DELETE' })
  return response.json()
}

export async function getWeakTopics() {
  const response = await authenticatedFetch('/weak-topics')
  return response.json()
}

export async function getRecommendations() {
  const response = await authenticatedFetch('/recommendations')
  return response.json()
}
