import { useState } from 'react'
import { predictStudentProblem } from '../services/mlService'
import { TOPICS, normalizeTopic } from '../utils/analytics'

const AddProblems = ({ HandleCancel, addProblem, editProblem }) => {
  const [title, setTitle] = useState(editProblem?.title || '')
  const [difficulty, setDifficulty] = useState(
    editProblem?.difficulty || 'Medium'
  )
  const [status, setStatus] = useState(
    editProblem?.status || 'Solved'
  )
  const [topic, setTopic] = useState(
    normalizeTopic(editProblem?.tags?.[0]) || ''
  )
  const [attempts, setAttempts] = useState(1)
  const [timeTaken, setTimeTaken] = useState('')
  const [error, setError] = useState('')

  // ML prediction state
  const [prediction, setPrediction] = useState(null)
  const [predictionLoading, setPredictionLoading] = useState(false)
  const [predictionError, setPredictionError] = useState('')

  const handlePrediction = async () => {
    if (!title.trim()) {
      setPredictionError('Enter a problem title first.')
      return
    }

    try {
      setPredictionLoading(true)
      setPredictionError('')
      setPrediction(null)

      const result = await predictStudentProblem(
        'demo-user',
        title.trim()
      )

      setPrediction(result)
    } catch (error) {
      console.error('Unable to get ML prediction:', error)
      setPredictionError(
        'Unable to get prediction from ML backend.'
      )
    } finally {
      setPredictionLoading(false)
    }
  }

  const submit = (event) => {
    event.preventDefault()

    if (!title.trim()) {
      setError('Enter a problem name.')
      return
    }

    if (
      !editProblem &&
      timeTaken !== '' &&
      Number(timeTaken) <= 0
    ) {
      setError('Time taken must be greater than zero.')
      return
    }

    addProblem({
      title: title.trim(),
      difficulty,
      status,
      tags: topic ? [topic] : [],
      sessionAttempts: Math.max(
        1,
        Number(attempts) || 1
      ),
      timeTaken:
        timeTaken === '' ? null : Number(timeTaken),
    })
  }

  return (
    <form
      className="problem-form"
      onSubmit={submit}
    >
      <div className="modal-heading">
        <div>
          <p className="eyebrow">
            {editProblem
              ? 'UPDATE YOUR HISTORY'
              : 'ADD TO YOUR HISTORY'}
          </p>

          <h2 id="problem-form-title">
            {editProblem
              ? 'Edit problem'
              : 'Log a problem'}
          </h2>
        </div>

        <button
          type="button"
          className="icon-button"
          aria-label="Close"
          onClick={HandleCancel}
        >
          <i className="ti ti-x" />
        </button>
      </div>

      <label>
        Problem name

        <input
          autoFocus
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
            setPrediction(null)
            setPredictionError('')
          }}
          placeholder="e.g. Two Sum"
        />
      </label>

      {/* ML Prediction */}
      {!editProblem && (
        <div className="prediction-section">
          <button
            type="button"
            className="button button-secondary"
            onClick={handlePrediction}
            disabled={predictionLoading}
          >
            {predictionLoading
              ? 'Analyzing...'
              : 'Predict my success'}
          </button>

          {predictionError && (
            <p
              className="form-error"
              role="alert"
            >
              {predictionError}
            </p>
          )}

          {prediction?.success_probability != null && (
  <div className="prediction-card">
    <strong>Estimated success probability</strong>

    <div className="prediction-value">
      {(prediction.success_probability * 100).toFixed(1)}%
    </div>

    <span>
      {prediction.success_probability >= 0.75
        ? 'Ready — try this problem independently.'
        : prediction.success_probability >= 0.5
          ? 'Moderate challenge — review the topic briefly, then try it.'
          : 'Challenging — consider practicing a few prerequisite problems first.'}
    </span>
  </div>
)}
        </div>
      )}

      <div className="form-grid-two">
        <label>
          Difficulty

          <select
            value={difficulty}
            onChange={(event) =>
              setDifficulty(event.target.value)
            }
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </label>

        <label>
          Status

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
          >
            <option>Solved</option>
            <option>Review</option>
            <option>Attempted</option>
          </select>
        </label>
      </div>

      <div className="form-grid-two">
        <label>
          Topic

          <select
            value={topic}
            onChange={(event) =>
              setTopic(event.target.value)
            }
          >
            <option value="">
              Select a topic
            </option>

            {TOPICS.map((item) => (
              <option key={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        {!editProblem && (
          <label>
            Attempts in this session

            <input
              type="number"
              min="1"
              value={attempts}
              onChange={(event) =>
                setAttempts(event.target.value)
              }
            />
          </label>
        )}
      </div>

      {!editProblem && (
        <label>
          Time taken (minutes)

          <input
            type="number"
            min="1"
            value={timeTaken}
            onChange={(event) =>
              setTimeTaken(event.target.value)
            }
            placeholder="e.g. 25"
          />
        </label>
      )}

      {error && (
        <p
          className="form-error"
          role="alert"
        >
          {error}
        </p>
      )}

      <p className="form-help">
        {editProblem
          ? 'Editing problem details will preserve its practice history.'
          : 'Each submission records a new practice session on this device.'}
      </p>

      <div className="modal-actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={HandleCancel}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="button button-primary"
        >
          {editProblem
            ? 'Save changes'
            : 'Save problem'}
        </button>
      </div>
    </form>
  )
}

export default AddProblems