export const TOPICS = [
  'Arrays',
  'Strings',
  'Sorting',
  'Linked Lists',
  'Stacks and Queues',
  'Binary Trees',
  'Binary Search Trees',
  'Graphs',
  'Dynamic Programming',
  'Greedy',
  'Backtracking',
  'Heaps',
  'Binary Search',
  'Sliding Window',
  'Two Pointers',
]

/*
 * --------------------------------------------------
 * Canonical topic names
 * --------------------------------------------------
 *
 * These names match the topic names used by the
 * FastAPI recommendation engine wherever possible.
 *
 * Frontend name              Backend/canonical name
 * --------------------------------------------------
 * Strings                    String / Text
 * Linked Lists               Linked List
 * Binary Trees               Trees / BST
 * Binary Search Trees        Trees / BST
 * Stacks and Queues          Stack
 * Heaps                      Heap
 * Binary Search              Searching
 */

export const TOPIC_NORMALIZATION = {
  // Arrays
  'Array': 'Arrays',
  'Arrays': 'Arrays',

  // Strings
  'String': 'String / Text',
  'Strings': 'String / Text',
  'String / Text': 'String / Text',

  // Linked Lists
  'Linked List': 'Linked List',
  'Linked Lists': 'Linked List',

  // Trees
  'Tree': 'Trees / BST',
  'Trees': 'Trees / BST',
  'Binary Tree': 'Trees / BST',
  'Binary Trees': 'Trees / BST',
  'Binary Search Tree': 'Trees / BST',
  'Binary Search Trees': 'Trees / BST',
  'BST': 'Trees / BST',
  'Trees / BST': 'Trees / BST',

  // Stack
  'Stack': 'Stack',
  'Stacks': 'Stack',

  // Queue
  'Queue': 'Queue',
  'Queues': 'Queue',

  // Existing frontend combined category
  'Stack and Queue': 'Stack',
  'Stacks and Queues': 'Stack',

  // Graphs
  'Graph': 'Graphs',
  'Graphs': 'Graphs',

  // Sorting
  'Sort': 'Sorting',
  'Sorting': 'Sorting',

  // Searching
  'Search': 'Searching',
  'Searching': 'Searching',
  'Binary Search': 'Searching',

  // Recursion
  'Recursion': 'Recursion',
  'Recursive': 'Recursion',

  // Hashing
  'Hash': 'Hashing',
  'Hashing': 'Hashing',

  // Heap
  'Heap': 'Heap',
  'Heaps': 'Heap',

  // Partitioning
  'Partitioning': 'Partitioning',
  'Partition': 'Partitioning',

  // Math
  'Math': 'Math / Theory',
  'Mathematics': 'Math / Theory',
  'Math / Theory': 'Math / Theory',

  // Dynamic Programming
  'DP': 'Dynamic Programming',
  'Dynamic Programming': 'Dynamic Programming',

  // Frontend-only / future categories
  'Greedy': 'Greedy',
  'Backtracking': 'Backtracking',
  'Sliding Window': 'Sliding Window',
  'Two Pointers': 'Two Pointers',
}


/*
 * --------------------------------------------------
 * User-friendly aliases
 * --------------------------------------------------
 *
 * These allow older MongoDB/frontend data to continue
 * working even if the capitalization or wording differs.
 */

const topicAliases = {
  array: 'Arrays',
  arrays: 'Arrays',

  string: 'Strings',
  strings: 'Strings',

  'linked list': 'Linked Lists',
  'linked lists': 'Linked Lists',

  stack: 'Stacks and Queues',
  stacks: 'Stacks and Queues',

  queue: 'Stacks and Queues',
  queues: 'Stacks and Queues',

  'stack and queue': 'Stacks and Queues',
  'stacks and queues': 'Stacks and Queues',

  tree: 'Binary Trees',
  trees: 'Binary Trees',

  'binary tree': 'Binary Trees',
  'binary trees': 'Binary Trees',

  bst: 'Binary Search Trees',

  'binary search tree': 'Binary Search Trees',
  'binary search trees': 'Binary Search Trees',

  graph: 'Graphs',
  graphs: 'Graphs',

  dp: 'Dynamic Programming',
  'dynamic programming': 'Dynamic Programming',

  greedy: 'Greedy',

  backtracking: 'Backtracking',

  heap: 'Heaps',
  heaps: 'Heaps',

  search: 'Binary Search',
  searching: 'Binary Search',
  'binary search': 'Binary Search',

  sorting: 'Sorting',
  sort: 'Sorting',

  recursion: 'Recursion',

  hash: 'Hashing',
  hashing: 'Hashing',

  partition: 'Partitioning',
  partitioning: 'Partitioning',

  math: 'Math / Theory',
  mathematics: 'Math / Theory',

  'math / theory': 'Math / Theory',

  'sliding window': 'Sliding Window',

  'two pointers': 'Two Pointers',
}


/*
 * --------------------------------------------------
 * Normalize topic
 * --------------------------------------------------
 */

export function normalizeTopic(topic) {
  const value = String(topic || '').trim()

  if (!value) {
    return 'Uncategorized'
  }

  /*
   * First try the alias map.
   */
  const aliasKey = value.toLowerCase()

  const alias = topicAliases[aliasKey]

  if (alias) {
    return TOPIC_NORMALIZATION[alias] || alias
  }

  /*
   * Then try the canonical normalization map.
   */
  if (TOPIC_NORMALIZATION[value]) {
    return TOPIC_NORMALIZATION[value]
  }

  /*
   * Finally return the original value.
   */
  return value
}


/*
 * --------------------------------------------------
 * Date helpers
 * --------------------------------------------------
 */

function validDate(value) {
  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? null
    : date
}


function dateKey(value) {
  const date = validDate(value)

  if (!date) {
    return null
  }

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1,
  ).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
}


function dayOffset(date, offset) {
  const result = new Date(date)

  result.setHours(0, 0, 0, 0)

  result.setDate(
    result.getDate() + offset,
  )

  return result
}


/*
 * --------------------------------------------------
 * Analytics
 * --------------------------------------------------
 */

export function getAnalytics(problems = []) {
  const records = Array.isArray(problems)
    ? problems
    : []

  const solved = records.filter(
    (problem) => problem.status === 'Solved',
  )


  /*
   * --------------------------------------------------
   * Difficulty statistics
   * --------------------------------------------------
   */

  const difficulty = [
    'Easy',
    'Medium',
    'Hard',
  ].map((level) => {
    const matching = records.filter(
      (problem) =>
        problem.difficulty === level,
    )

    const completed = matching.filter(
      (problem) =>
        problem.status === 'Solved',
    ).length

    return {
      name: level,
      total: matching.length,
      solved: completed,
      completionRate: matching.length
        ? Math.round(
            (completed / matching.length) * 100,
          )
        : null,
    }
  })


  /*
   * --------------------------------------------------
   * Weekly activity
   * --------------------------------------------------
   */

  const today = new Date()

  today.setHours(0, 0, 0, 0)

  const weekStart = dayOffset(
    today,
    -6,
  )

  const weeklyActivity = Array.from(
    { length: 7 },
    (_, index) => {
      const date = dayOffset(
        weekStart,
        index,
      )

      const key = dateKey(date)

      return {
        date,

        label: date.toLocaleDateString(
          undefined,
          {
            weekday: 'short',
          },
        ),

        count: solved.filter(
          (problem) =>
            dateKey(problem.date) === key,
        ).length,
      }
    },
  )


  /*
   * --------------------------------------------------
   * Streak
   * --------------------------------------------------
   */

  const activeDays = new Set(
    records
      .map((problem) =>
        dateKey(problem.date),
      )
      .filter(Boolean),
  )

  let streak = 0

  const todayKey = dateKey(today)

  const yesterdayKey = dateKey(
    dayOffset(today, -1),
  )

  if (
    activeDays.has(todayKey) ||
    activeDays.has(yesterdayKey)
  ) {
    let cursor = activeDays.has(
      todayKey,
    )
      ? today
      : dayOffset(today, -1)

    while (
      activeDays.has(
        dateKey(cursor),
      )
    ) {
      streak += 1

      cursor = dayOffset(
        cursor,
        -1,
      )
    }
  }


  /*
   * --------------------------------------------------
   * Topic statistics
   * --------------------------------------------------
   *
   * IMPORTANT:
   * Every topic is normalized before comparison.
   */

  const topicNames = new Set(
    TOPICS.map(normalizeTopic),
  )

  records.forEach((problem) => {
    ;(problem.tags || []).forEach(
      (tag) => {
        if (tag) {
          topicNames.add(
            normalizeTopic(tag),
          )
        }
      },
    )
  })


  const topics = [...topicNames].map(
    (name) => {
      const topicRecords = records.filter(
        (problem) =>
          (problem.tags || []).some(
            (tag) =>
              normalizeTopic(tag) ===
              name,
          ),
      )

      const topicSolved =
        topicRecords.filter(
          (problem) =>
            problem.status === 'Solved',
        )

      const unsolved =
        topicRecords.filter(
          (problem) =>
            problem.status !== 'Solved',
        )

      const repeated =
        topicRecords.filter(
          (problem) =>
            Number(problem.attempts) > 1,
        )

      const hardUnsolved =
        unsolved.filter(
          (problem) =>
            problem.difficulty === 'Hard',
        )

      const recentUnsolved =
        unsolved.filter((problem) => {
          const date = validDate(
            problem.date,
          )

          return (
            date &&
            date >=
              dayOffset(today, -29) &&
            date <= today
          )
        })


      const failureRatio =
        topicRecords.length
          ? unsolved.length /
            topicRecords.length
          : 0

      const repeatRatio =
        topicRecords.length
          ? repeated.length /
            topicRecords.length
          : 0

      const hardRatio =
        topicRecords.length
          ? hardUnsolved.length /
            topicRecords.length
          : 0

      const recentRatio =
        topicRecords.length
          ? recentUnsolved.length /
            topicRecords.length
          : 0


      const signalScore =
        Math.round(
          (
            failureRatio * 0.5 +
            repeatRatio * 0.2 +
            hardRatio * 0.2 +
            recentRatio * 0.1
          ) * 100,
        )


      const enoughEvidence =
        topicRecords.length >= 2 ||
        repeated.length >= 1


      let status =
        'Not enough data'

      if (
        enoughEvidence &&
        signalScore >= 50
      ) {
        status = 'Needs practice'
      } else if (
        enoughEvidence &&
        topicSolved.length /
          topicRecords.length >=
          0.8
      ) {
        status = 'Strong'
      } else if (
        topicRecords.length
      ) {
        status = 'Building evidence'
      }


      const reasons = []

      if (unsolved.length) {
        reasons.push(
          `${unsolved.length} of ${topicRecords.length} logged problem(s) are not marked solved`,
        )
      }

      if (repeated.length) {
        reasons.push(
          `${repeated.length} problem(s) have multiple logged attempts`,
        )
      }

      if (hardUnsolved.length) {
        reasons.push(
          `${hardUnsolved.length} hard problem(s) remain unsolved`,
        )
      }

      if (recentUnsolved.length) {
        reasons.push(
          `${recentUnsolved.length} unsolved problem(s) were logged in the last 30 days`,
        )
      }


      return {
        name,

        records:
          topicRecords.length,

        solved:
          topicSolved.length,

        unsolved:
          unsolved.length,

        completionRate:
          topicRecords.length
            ? Math.round(
                (
                  topicSolved.length /
                  topicRecords.length
                ) * 100,
              )
            : null,

        signalScore,

        status,

        reasons,
      }
    },
  )


  /*
   * --------------------------------------------------
   * Rule-based fallback recommendations
   * --------------------------------------------------
   *
   * The actual ML recommendations come from
   * FastAPI /recommendations/{userId}.
   *
   * This remains useful as a local fallback.
   */

  const recommendations = records
    .filter(
      (problem) =>
        problem.status !== 'Solved' ||
        Number(problem.attempts) > 1,
    )
    .map((problem) => {
      const problemTopics = (
        problem.tags || []
      ).map(normalizeTopic)

      const weakTopic = topics.find(
        (topic) =>
          problemTopics.includes(
            topic.name,
          ) &&
          topic.status ===
            'Needs practice',
      )

      const isUnsolved =
        problem.status !== 'Solved'


      const reason = isUnsolved
        ? weakTopic
          ? `${weakTopic.name} is flagged for practice, and this logged problem is still marked ${problem.status.toLowerCase()}.`
          : `This problem is marked ${problem.status.toLowerCase()} in your practice history; revisit it before adding new problems.`
        : `You logged multiple attempts for this solved problem; revisiting it can reinforce the approach.`


      return {
        ...problem,

        /*
         * Store canonical topic names.
         */
        topic:
          problemTopics.join(', ') ||
          'Topic not recorded',

        reason,

        priority:
          isUnsolved && weakTopic
            ? 'High'
            : isUnsolved
              ? 'Medium'
              : 'Review',
      }
    })
    .sort((first, second) => {
      const priority = {
        High: 0,
        Medium: 1,
        Review: 2,
      }

      return (
        priority[first.priority] -
        priority[second.priority]
      )
    })


  /*
   * --------------------------------------------------
   * Recent trend
   * --------------------------------------------------
   */

  const recentTrend = Array.from(
    { length: 30 },
    (_, index) => {
      const date = dayOffset(
        today,
        index - 29,
      )

      const key = dateKey(date)

      return {
        date,

        label:
          date.toLocaleDateString(
            undefined,
            {
              month: 'short',
              day: 'numeric',
            },
          ),

        count: solved.filter(
          (problem) =>
            dateKey(problem.date) ===
            key,
        ).length,
      }
    },
  )


  const last30Days = records.filter(
    (problem) => {
      const date = validDate(
        problem.date,
      )

      return (
        date &&
        date >=
          dayOffset(today, -29) &&
        date <= today
      )
    },
  )


  return {
    total: records.length,

    solved: solved.length,

    unsolved:
      records.length -
      solved.length,

    completionRate:
      records.length
        ? Math.round(
            (solved.length /
              records.length) *
              100,
          )
        : null,

    accuracy: null,

    difficulty,

    weeklyActivity,

    recentTrend,

    streak,

    activeDays: new Set(
      last30Days.map((problem) =>
        dateKey(problem.date),
      ),
    ).size,

    topics: topics.sort(
      (first, second) =>
        second.records -
          first.records ||
        first.name.localeCompare(
          second.name,
        ),
    ),

    recommendations,
  }
}


/*
 * --------------------------------------------------
 * Goal progress
 * --------------------------------------------------
 */

export function getGoalProgress(
  goal,
  problems,
  analytics,
) {
  const solved = problems.filter(
    (problem) =>
      problem.status === 'Solved',
  )

  if (goal.type === 'weekly') {
    return analytics.weeklyActivity.reduce(
      (sum, day) =>
        sum + day.count,
      0,
    )
  }

  if (goal.type === 'topic') {
    const targetTopic =
      normalizeTopic(goal.topic)

    return solved.filter(
      (problem) =>
        (problem.tags || []).some(
          (tag) =>
            normalizeTopic(tag) ===
            targetTopic,
        ),
    ).length
  }

  if (goal.type === 'difficulty') {
    return solved.filter(
      (problem) =>
        problem.difficulty ===
        goal.difficulty,
    ).length
  }

  return solved.length
}