import { useContext, useMemo, useState } from 'react'
import AddProblems from '../../components/AddProblems'
import ProblemTable from '../../components/ProblemTable'
import { Problemcontext } from '../../context/context'
import { TOPICS } from '../../utils/analytics'
import {
  createProblem,
  updateProblem,
  deleteProblem as deleteProblemFromDb,
} from '../../services/mlService'


const Problems = () => {
  const { problems, setProblems } = useContext(Problemcontext)

  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [query, setQuery] = useState('')
  const [topicFilter, setTopicFilter] = useState('All topics')
  const [statusFilter, setStatusFilter] = useState('All statuses')

  const filtered = useMemo(
    () =>
      problems.filter((problem) => {
        const matchesText = `${problem.title} ${(problem.tags || []).join(
          ' '
        )}`
          .toLowerCase()
          .includes(query.toLowerCase())

        const matchesTopic =
          topicFilter === 'All topics' ||
          (problem.tags || []).includes(topicFilter)

        const matchesStatus =
          statusFilter === 'All statuses' ||
          problem.status === statusFilter

        return matchesText && matchesTopic && matchesStatus
      }),
    [problems, query, topicFilter, statusFilter]
  )

  const saveProblem = async (problem) => {
    const currentDate = new Date().toISOString()

    /*
     * ---------------------------------------------------------
     * EDIT EXISTING PROBLEM
     * ---------------------------------------------------------
     *
     * Editing a problem should NOT create a new practice attempt.
     */
    if (editing) {
      const updatedProblem = {
        userId: editing.userId || 'demo-user',
        title: problem.title,
        difficulty: problem.difficulty,
        status: problem.status,
        tags: problem.tags,

        // Preserve existing attempt information
        attempts: editing.attempts || 0,
        attemptHistory: editing.attemptHistory || [],

        // Preserve existing time/date when editing
        timeTaken: editing.timeTaken ?? null,
        date: editing.date || currentDate,
      }

      try {
        await updateProblem(editing.id, updatedProblem)

        setProblems((current) =>
          current.map((item) =>
            item.id === editing.id
              ? {
                  ...item,
                  ...updatedProblem,
                  id: editing.id,
                }
              : item
          )
        )
      } catch (error) {
        console.error('Unable to update problem:', error)
        alert('Unable to update problem in MongoDB.')
        return
      }
    } else {
      /*
       * ---------------------------------------------------------
       * NEW PRACTICE SESSION
       * ---------------------------------------------------------
       */

      const existing = problems.find(
        (item) =>
          item.title.trim().toLowerCase() ===
          problem.title.trim().toLowerCase()
      )

      const newAttempt = {
        attempts: problem.sessionAttempts,
        solved: problem.status === 'Solved',
        timeTaken: problem.timeTaken,
        date: currentDate,
      }

      /*
       * ---------------------------------------------------------
       * EXISTING PROBLEM
       * ---------------------------------------------------------
       *
       * The user is practicing a problem that already exists.
       *
       * We:
       * 1. Increase total attempts
       * 2. Add a new attemptHistory entry
       * 3. Update MongoDB
       * 4. Update React state
       */
      if (existing) {
        const updatedProblem = {
          userId: existing.userId || 'demo-user',
          title: existing.title,
          difficulty: problem.difficulty,
          status: problem.status,
          tags: problem.tags,

          attempts:
            (Number(existing.attempts) || 0) +
            problem.sessionAttempts,

          attemptHistory: [
            ...(existing.attemptHistory || []),
            newAttempt,
          ],

          timeTaken: problem.timeTaken,
          date: currentDate,
        }

        try {
          await updateProblem(existing.id, updatedProblem)

          setProblems((current) =>
            current.map((item) =>
              item.id === existing.id
                ? {
                    ...item,
                    ...updatedProblem,
                    id: existing.id,
                  }
                : item
            )
          )
        } catch (error) {
          console.error('Unable to update problem:', error)
          alert('Unable to save this practice session to MongoDB.')
          return
        }
      } else {
        /*
         * ---------------------------------------------------------
         * COMPLETELY NEW PROBLEM
         * ---------------------------------------------------------
         *
         * Create a new MongoDB document.
         */
        const newProblem = {
          userId: 'demo-user',
          title: problem.title,
          difficulty: problem.difficulty,
          status: problem.status,
          tags: problem.tags,

          attempts: problem.sessionAttempts,

          attemptHistory: [newAttempt],

          timeTaken: problem.timeTaken,

          date: currentDate,
        }

        try {
          const savedProblem = await createProblem(newProblem)

          setProblems((current) => [
            ...current,
            {
              ...newProblem,
              id: savedProblem.id,
            },
          ])
        } catch (error) {
          console.error('Unable to save problem:', error)
          alert('Unable to save problem to MongoDB.')
          return
        }
      }
    }

    /*
     * Close the modal after successful save/edit.
     */
    setEditing(null)
    setShowForm(false)
  }

  const openNew = () => {
    setEditing(null)
    setShowForm(true)
  }

  const openEdit = (problem) => {
    setEditing(problem)
    setShowForm(true)
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">YOUR CODING JOURNEY</p>

          <h1>My practice</h1>

          <p className="page-subtitle">
            {problems.length} problem
{problems.length === 1 ? '' : 's'} logged · synced with MongoDB
          </p>
        </div>

        <button
          className="button button-primary"
          onClick={openNew}
        >
          <i className="ti ti-plus" /> Log a problem
        </button>
        
      </header>

      <section className="panel">
        <div className="practice-filters">
          <label className="search-field">
            <i className="ti ti-search" />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search problems or topics"
            />
          </label>

          <select
            aria-label="Filter by topic"
            value={topicFilter}
            onChange={(event) => setTopicFilter(event.target.value)}
          >
            <option>All topics</option>

            {TOPICS.map((topic) => (
              <option key={topic}>{topic}</option>
            ))}
          </select>

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option>All statuses</option>
            <option>Solved</option>
            <option>Review</option>
            <option>Attempted</option>
          </select>
        </div>

        <ProblemTable
  problems={filtered}
  deleteProblem={async (id) => {
    try {
      await deleteProblemFromDb(id)

      setProblems((current) =>
        current.filter((problem) => problem.id !== id)
      )
    } catch (error) {
      console.error('Unable to delete problem:', error)
      alert('Unable to delete problem from MongoDB.')
    }
  }}
  handleEdit={openEdit}
/>

        {!filtered.length && (
          <div className="empty-state compact-empty">
            <i className="ti ti-search-off" />

            <strong>
              {problems.length
                ? 'No matching problems'
                : 'Your practice history is empty'}
            </strong>

            <span>
              {problems.length
                ? 'Try changing your search or filters.'
                : 'Add a problem to start building your learning history.'}
            </span>

            {!problems.length && (
              <button
                className="button button-secondary"
                onClick={openNew}
              >
                Log your first problem
              </button>
            )}
          </div>
        )}
      </section>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false)
            }
          }}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="problem-form-title"
          >
            <AddProblems
              HandleCancel={() => {
                setShowForm(false)
                setEditing(null)
              }}
              addProblem={saveProblem}
              problems={problems}
              editProblem={editing}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Problems
