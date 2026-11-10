from datetime import datetime, timezone


def build_student_features(problems, target_problem_title=None):
    """
    Build the features required by the trained Random Forest model
    from a student's MongoDB practice history.

    If target_problem_title is provided, the function also calculates
    the student's previous history on that specific problem.
    """

    if not problems:
        now = datetime.now(timezone.utc)

        return {
            "previous_attempts": 0,
            "previous_success_rate": 0.0,
            "recent_success_rate_5": 0.0,
            "previous_problem_attempts": 0,
            "previous_problem_success_rate": 0.0,
            "hour": now.hour,
            "day_of_week": now.weekday(),
            "days_since_first_submission": 0.0,
        }

    sessions = []

    for problem in problems:
        history = problem.get("attemptHistory", [])

        if not history:
            continue

        for attempt in history:
            sessions.append({
                "problem_title": problem.get("title", ""),
                "attempts": int(attempt.get("attempts", 1) or 1),
                "solved": bool(attempt.get("solved", False)),
                "date": attempt.get("date"),
            })

    if not sessions:
        now = datetime.now(timezone.utc)

        return {
            "previous_attempts": 0,
            "previous_success_rate": 0.0,
            "recent_success_rate_5": 0.0,
            "previous_problem_attempts": 0,
            "previous_problem_success_rate": 0.0,
            "hour": now.hour,
            "day_of_week": now.weekday(),
            "days_since_first_submission": 0.0,
        }

    # Convert dates into datetime objects
    valid_sessions = []

    for session in sessions:
        date_value = session.get("date")

        if not date_value:
            continue

        try:
            dt = datetime.fromisoformat(
                date_value.replace("Z", "+00:00")
            )

            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)

            session["datetime"] = dt
            valid_sessions.append(session)

        except (ValueError, TypeError):
            continue

    if not valid_sessions:
        now = datetime.now(timezone.utc)

        return {
            "previous_attempts": 0,
            "previous_success_rate": 0.0,
            "recent_success_rate_5": 0.0,
            "previous_problem_attempts": 0,
            "previous_problem_success_rate": 0.0,
            "hour": now.hour,
            "day_of_week": now.weekday(),
            "days_since_first_submission": 0.0,
        }

    # Make sure history is chronological
    valid_sessions.sort(
        key=lambda session: session["datetime"]
    )

    now = datetime.now(timezone.utc)

    # ---------------------------------------------------------
    # 1. Overall student history
    # ---------------------------------------------------------

    previous_attempts = sum(
        session["attempts"]
        for session in valid_sessions
    )

    previous_successes = sum(
        1
        for session in valid_sessions
        if session["solved"]
    )

    if previous_attempts > 0:
        previous_success_rate = (
            previous_successes / previous_attempts
        )
    else:
        previous_success_rate = 0.0

    # ---------------------------------------------------------
    # 2. Recent performance
    # ---------------------------------------------------------

    recent_sessions = valid_sessions[-5:]

    if recent_sessions:
        recent_success_rate_5 = sum(
            1
            for session in recent_sessions
            if session["solved"]
        ) / len(recent_sessions)
    else:
        recent_success_rate_5 = 0.0

    # ---------------------------------------------------------
    # 3. Student experience over time
    # ---------------------------------------------------------

    first_submission = valid_sessions[0]["datetime"]

    days_since_first_submission = (
        now - first_submission
    ).total_seconds() / (60 * 60 * 24)

    days_since_first_submission = max(
        0.0,
        days_since_first_submission
    )

    # ---------------------------------------------------------
    # 4. Current time
    # ---------------------------------------------------------

    hour = now.hour
    day_of_week = now.weekday()

    # ---------------------------------------------------------
    # 5. Target problem history
    # ---------------------------------------------------------

    previous_problem_attempts = 0
    previous_problem_successes = 0

    if target_problem_title:
        target_title = target_problem_title.strip().lower()

        target_sessions = [
            session
            for session in valid_sessions
            if session["problem_title"].strip().lower()
            == target_title
        ]

        previous_problem_attempts = sum(
            session["attempts"]
            for session in target_sessions
        )

        previous_problem_successes = sum(
            1
            for session in target_sessions
            if session["solved"]
        )

    if previous_problem_attempts > 0:
        previous_problem_success_rate = (
            previous_problem_successes
            / previous_problem_attempts
        )
    else:
        previous_problem_success_rate = 0.0

    return {
        "previous_attempts": previous_attempts,
        "previous_success_rate": previous_success_rate,
        "recent_success_rate_5": recent_success_rate_5,
        "previous_problem_attempts": previous_problem_attempts,
        "previous_problem_success_rate": previous_problem_success_rate,
        "hour": hour,
        "day_of_week": day_of_week,
        "days_since_first_submission": days_since_first_submission,
    }