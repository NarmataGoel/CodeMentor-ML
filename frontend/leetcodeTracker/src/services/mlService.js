const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

export async function getMlServiceStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new Error("ML backend is not healthy");
    }

    const data = await response.json();

    return {
      connected: true,
      message: data.status === "healthy"
        ? "FastAPI ML backend is connected"
        : "FastAPI is running"
    };
  } catch {
    return {
      connected: false,
      message: "Unable to connect to FastAPI ML backend"
    };
  }
}

export async function predictSuccess(features) {
  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(features)
    });

    if (!response.ok) {
      throw new Error("Prediction request failed");
    }

    return await response.json();
  } catch (error) {
    console.error("ML prediction error:", error);
    throw error;
  }
}

export async function predictStudentProblem(userId, problemTitle) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/predict/${encodeURIComponent(userId)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problemTitle,
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Student prediction request failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Student prediction error:', error)
    throw error
  }
}

export async function createProblem(problem) {
  const response = await fetch(`${API_BASE_URL}/problems`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(problem),
  })

  if (!response.ok) {
    throw new Error('Failed to save problem')
  }

  return await response.json()
}


export async function getProblems(userId) {
  const response = await fetch(
    `${API_BASE_URL}/problems?userId=${encodeURIComponent(userId)}`
  )

  if (!response.ok) {
    throw new Error('Failed to load problems')
  }

  return await response.json()
}

export async function updateProblem(problemId, problem) {
  const response = await fetch(
    `${API_BASE_URL}/problems/${problemId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(problem),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to update problem')
  }

  return await response.json()
}

export async function deleteProblem(problemId) {
  const response = await fetch(
    `${API_BASE_URL}/problems/${problemId}`,
    {
      method: 'DELETE',
    }
  )

  if (!response.ok) {
    throw new Error('Failed to delete problem')
  }

  return await response.json()
}

export async function getWeakTopics(userId) {
  const response = await fetch(
    `${API_BASE_URL}/weak-topics/${encodeURIComponent(userId)}`
  )

  if (!response.ok) {
    throw new Error('Failed to load weak topics')
  }

  return await response.json()
}

export async function getRecommendations(userId) {
  const response = await fetch(
    `${API_BASE_URL}/recommendations/${encodeURIComponent(userId)}`
  )

  if (!response.ok) {
    throw new Error('Failed to load recommendations')
  }

  return await response.json()
}
