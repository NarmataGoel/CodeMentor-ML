import math


def calculate_weak_topics(problems, top_n=3):
    """
    Calculate a student's weakest DSA topics from MongoDB practice history.

    Each problem is expected to contain:
    - title
    - tags
    - attemptHistory

    Returns the top weak topics ranked by weakness score.
    """

    topic_stats = {}

    for problem in problems:
        tags = problem.get("tags", [])
        history = problem.get("attemptHistory", [])

        if not tags or not history:
            continue

        # A problem can have multiple tags.
        for topic in tags:
            topic = str(topic).strip()

            if not topic:
                continue

            if topic not in topic_stats:
                topic_stats[topic] = {
                    "attempts": 0,
                    "sessions": 0,
                    "successes": 0,
                }

            for attempt in history:
                attempts = int(
                    attempt.get("attempts", 1) or 1
                )

                solved = bool(
                    attempt.get("solved", False)
                )

                topic_stats[topic]["attempts"] += attempts
                topic_stats[topic]["sessions"] += 1

                if solved:
                    topic_stats[topic]["successes"] += 1

    results = []

    for topic, stats in topic_stats.items():
        attempts = stats["attempts"]
        sessions = stats["sessions"]
        successes = stats["successes"]

        if sessions == 0:
            continue

        success_rate = successes / sessions

        # More failed attempts + more practice history
        # produces a stronger weakness score.
        weakness_score = (
            (1 - success_rate)
            * math.log1p(attempts)
        )

        results.append({
            "topic": topic,
            "attempts": attempts,
            "sessions": sessions,
            "successes": successes,
            "success_rate": success_rate,
            "weakness_score": weakness_score,
        })

    results.sort(
        key=lambda item: item["weakness_score"],
        reverse=True
    )

    if top_n is None:
       return results

    return results[:top_n]
