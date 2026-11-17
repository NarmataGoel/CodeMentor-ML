import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getRecommendations } from '../../services/mlService'
import { normalizeTopic } from '../../utils/analytics'

const Recommendations = () => {
  const [searchParams] = useSearchParams()
  const filterTopic = searchParams.get('topic')

  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getRecommendations()

        setRecommendations(
          data.recommendations || []
        )
      } catch (error) {
        console.error(
          'Unable to load recommendations:',
          error
        )

        setError(
          'Unable to load personalized recommendations.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [])

  const filteredRecommendations =
    recommendations.filter(
      (problem) =>
        !filterTopic ||
        normalizeTopic(problem.topic) ===
        normalizeTopic(filterTopic)
    )

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">
            WHAT TO PRACTICE NEXT
          </p>

          <h1>Practice recommendations</h1>

          <p className="page-subtitle">
            Personalized suggestions based on your
            practice history and topic performance.
          </p>
        </div>

        <Link
          className="button button-secondary"
          to="/practice"
        >
          <i className="ti ti-plus" /> Log a problem
        </Link>
      </header>

      <div className="notice notice-info">
        <i className="ti ti-sparkles" />

        <p>
          <strong>Personalized recommendations.</strong>{' '}
          CodeMentor analyzes your previous attempts,
          success rates, and weaker topic areas to decide
          which problems deserve more practice.
        </p>
      </div>

      {filterTopic && (
        <div className="filter-banner">
          Showing suggestions tagged{' '}
          <strong>{filterTopic}</strong>

          <Link to="/recommendations">
            Clear filter
          </Link>
        </div>
      )}

      {loading && (
        <div className="panel empty-state">
          <i className="ti ti-loader-2" />

          <strong>
            Building your recommendations...
          </strong>

          <span>
            CodeMentor is analyzing your practice history.
          </span>
        </div>
      )}

      {!loading && error && (
        <div className="panel empty-state">
          <i className="ti ti-alert-circle" />

          <strong>
            Unable to load recommendations
          </strong>

          <span>{error}</span>
        </div>
      )}

      {!loading &&
        !error &&
        filteredRecommendations.length > 0 && (
          <section className="recommendation-list">
            {filteredRecommendations.map(
              (problem, index) => {
                const percentage = (value) => Math.round(Math.max(0, Math.min(1, Number(value) || 0)) * 100)
                const successRate = percentage(problem.success_rate)
                const successProbability = percentage(problem.success_probability)
                const hasHistory = Number(problem.sessions) > 0
                const displayTitle = String(problem.title || 'Recommended problem').replace(/[_-]+/g, ' ')

                const priority =
                  problem.recommendation_score >= 0.75
                    ? 'High'
                    : problem.recommendation_score >= 0.4
                      ? 'Medium'
                      : 'Review'

                return (
                  <article
                    className={`panel recommendation-card recommendation-card-plain priority-card-${priority.toLowerCase()}`}
                    key={`${problem.title}-${index}`}
                  >
                    <div className="recommendation-main">
                      <div className="rec-card-heading">
                        <div className="rec-title-block">
                          <h2>{displayTitle}</h2>
                          <div className="rec-tags">
                            <span className="rec-topic"><i className="ti ti-git-branch" /> {problem.topic}</span>
                            <span className={`difficulty-badge difficulty-${String(problem.difficulty || '').toLowerCase()}`}>
                              {problem.difficulty || 'Difficulty not recorded'}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`priority-badge priority-${priority.toLowerCase()}`}
                        >
                          {priority === 'High' ? 'Focus next' : priority === 'Medium' ? 'Recommended' : 'Build familiarity'}
                        </span>
                      </div>

                      <div className="rec-signal-grid">
                        <div className="rec-prediction">
                          <div className="rec-prediction-ring" style={{ '--prediction': `${successProbability}%` }}>
                            <span>{successProbability}%</span>
                          </div>
                          <div><strong>Estimated success</strong><small>Based on your practice data</small></div>
                        </div>
                        <div className="rec-history-signal">
                          <div className="rec-history-top">
                            <span>Your past results</span>
                            <strong>{hasHistory ? `${successRate}%` : 'New topic'}</strong>
                          </div>
                          <div className="rec-meter"><span style={{ width: `${hasHistory ? successRate : 0}%` }} /></div>
                          <small>{hasHistory ? `${problem.successes || 0} solved in ${problem.sessions} sessions · ${problem.attempts || 0} tries` : 'No previous attempts recorded'}</small>
                        </div>
                      </div>

                      <details className="rec-explanation">
                        <summary>Why this problem?</summary>
                        <p>{problem.reason}</p>
                      </details>
                    </div>

                    <Link className="button button-primary rec-practice-button" to="/practice">Practice this <i className="ti ti-arrow-right" /></Link>
                  </article>
                )
              }
            )}
          </section>
        )}

      {!loading &&
        !error &&
        filteredRecommendations.length === 0 && (
          <div className="panel empty-state recommendation-empty">
            <i className="ti ti-sparkles" />

            <strong>
              {filterTopic
                ? 'No recommendations for this topic'
                : 'Not enough recommendation data yet'}
            </strong>

            <span>
              {filterTopic
                ? 'Try another topic or clear the current filter.'
                : 'Log more practice attempts so CodeMentor can identify useful patterns.'}
            </span>

            <Link
              className="button button-primary"
              to="/practice"
            >
              Go to My Practice
            </Link>
          </div>
        )}
    </div>
  )
}

export default Recommendations
