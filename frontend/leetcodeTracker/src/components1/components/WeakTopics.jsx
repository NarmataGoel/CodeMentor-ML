import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getWeakTopics } from '../../services/mlService'

const WeakTopics = () => {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadWeakTopics = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getWeakTopics('demo-user')

        setTopics(data.weakTopics || [])
      } catch (error) {
        console.error('Unable to load weak topics:', error)
        setError('Unable to load personalized topic analysis.')
      } finally {
        setLoading(false)
      }
    }

    loadWeakTopics()
  }, [])

  const needsPractice = topics
    .filter((topic) => topic.attempts > 0)
    .slice(0, 3)

  const otherTopics = topics.slice(3)

  const getSignalScore = (topic) => {
  const maxWeaknessScore = Math.max(
    ...topics.map((item) => item.weakness_score),
    0
  )

  if (maxWeaknessScore === 0) {
    return 0
  }

  return Math.round(
    (topic.weakness_score / maxWeaknessScore) * 100
  )
}

  const getStatus = (topic) => {
    const score = getSignalScore(topic)

    if (score >= 50) {
      return 'Needs practice'
    }

    if (topic.success_rate >= 0.7) {
      return 'Strong'
    }

    return 'Developing'
  }

  const getReason = (topic) => {
    const successRate = Math.round(
      topic.success_rate * 100
    )

    if (successRate < 50) {
      return `Your success rate is ${successRate}%, indicating difficulty with this topic.`
    }

    if (topic.attempts < 3) {
      return 'There is limited practice evidence for this topic so far.'
    }

    return `Your current success rate is ${successRate}% across ${topic.attempts} attempts.`
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">ML-POWERED REVIEW</p>

          <h1>Weak topics</h1>

          <p className="page-subtitle">
            Topic signals are calculated from your saved practice
            history using your personalized performance data.
          </p>
        </div>

        <Link
          className="button button-secondary"
          to="/practice"
        >
          <i className="ti ti-plus" /> Log practice
        </Link>
      </header>

      <div className="notice notice-info">
        <i className="ti ti-sparkles" />

        <p>
          These signals are generated from your actual practice
          history. Topics with lower success rates and more
          supporting practice evidence receive stronger weakness
          scores.
        </p>
      </div>

      {loading && (
        <div className="panel empty-state">
          <i className="ti ti-loader-2" />

          <strong>
            Analyzing your practice history...
          </strong>

          <span>
            CodeMentor is calculating your current topic signals.
          </span>
        </div>
      )}

      {!loading && error && (
        <div className="panel empty-state">
          <i className="ti ti-alert-circle" />

          <strong>
            Unable to load topic analysis
          </strong>

          <span>{error}</span>
        </div>
      )}

      {!loading && !error && !topics.length && (
        <div className="panel empty-state">
          <i className="ti ti-mood-smile" />

          <strong>
            Not enough practice data yet
          </strong>

          <span>
            Log a few problems to build a personalized topic
            performance picture.
          </span>
        </div>
      )}

      {!loading && !error && topics.length > 0 && (
        <>
          <section className="topic-insight-grid">
            {needsPractice.map((topic) => {
              const signalScore = getSignalScore(topic)
              const status = getStatus(topic)

              return (
                <article
                  className="panel insight-card insight-warning"
                  key={topic.topic}
                >
                  <div className="insight-top">
                    <span className="signal-pill signal-warning">
                      {status}
                    </span>

                    <span className="signal-score">
                      Signal {signalScore}/100
                    </span>
                  </div>

                  <h2>{topic.topic}</h2>

                  <p className="insight-summary">
                    {topic.successes} successful outcomes out of{' '}
                    {topic.attempts} attempts
                  </p>

                  <div className="progress-track">
                    <span
                      style={{
                        width: `${Math.round(
                          topic.success_rate * 100
                        )}%`,
                      }}
                    />
                  </div>

                  <strong className="reason-heading">
                    Why this signal?
                  </strong>

                  <ul className="reason-list">
                    <li>{getReason(topic)}</li>

                    <li>
                      Weakness score:{' '}
                      {topic.weakness_score.toFixed(2)}
                    </li>
                  </ul>

                  <Link
                    className="text-link"
                    to={`/recommendations?topic=${encodeURIComponent(
                      topic.topic
                    )}`}
                  >
                    Review related practice{' '}
                    <i className="ti ti-arrow-right" />
                  </Link>
                </article>
              )
            })}
          </section>

          {otherTopics.length > 0 && (
            <article className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Other topic signals</h2>

                  <p>
                    Strong performance and developing areas are
                    kept distinct.
                  </p>
                </div>
              </div>

              <div className="topic-signal-list">
                {otherTopics.map((topic) => {
                  const status = getStatus(topic)

                  return (
                    <div
                      className="topic-signal-row"
                      key={topic.topic}
                    >
                      <div>
                        <strong>{topic.topic}</strong>

                        <span>
                          {topic.successes}/
                          {topic.attempts} successful outcomes
                        </span>
                      </div>

                      <span
                        className={`signal-pill ${
                          status === 'Strong'
                            ? 'signal-good'
                            : 'signal-neutral'
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  )
                })}
              </div>
            </article>
          )}
        </>
      )}
    </div>
  )
}

export default WeakTopics