import json
import math
import re
from pathlib import Path

from app.model import predict_success
from app.features import build_student_features


BASE_DIR = Path(__file__).resolve().parent.parent

CATALOG_PATH = (
    BASE_DIR
    / "data"
    / "problems_catalog.json"
)


# --------------------------------------------------
# Cold-start learning progression
# --------------------------------------------------

COLD_START_TOPIC_ORDER = [
    "Arrays",
    "Searching",
    "Sorting",
    "Linked List",
    "Stack",
    "Queue",
    "Recursion",
    "Hashing",
    "Trees / BST",
    "Heap",
    "Graphs",
    "String / Text",
    "Partitioning",
    "Math / Theory",
]


def normalize_problem_key(title):
    """
    Convert problem titles into a consistent comparison key.

    Examples:
        Binary Search  -> binary_search
        binary_search  -> binary_search
        Binary-Search  -> binary_search
    """

    return re.sub(
        r"[^a-z0-9]+",
        "_",
        str(title).lower()
    ).strip("_")


def load_problem_catalog():
    """Load the complete CodeMentor problem catalog."""

    if not CATALOG_PATH.exists():
        return []

    with open(
        CATALOG_PATH,
        "r",
        encoding="utf-8"
    ) as file:
        return json.load(file)


def build_recommendations(problems, top_n=5):
    """
    Build adaptive recommendations using:

    1. Repeatedly unresolved problems
    2. Weak topic performance
    3. Unexplored problems/topics
    4. ML predicted challenge fit
    5. Previous problem performance
    6. Cold-start learning progression
    """

    catalog = load_problem_catalog()

    # --------------------------------------------------
    # 1. Build student's problem statistics
    # --------------------------------------------------

    problem_stats = {}
    topic_stats = {}

    for problem in problems:

        title = str(
            problem.get("title", "")
        ).strip()

        if not title:
            continue

        tags = problem.get("tags", [])
        history = problem.get(
            "attemptHistory",
            []
        )

        attempts = 0
        successes = 0

        for attempt in history:

            session_attempts = int(
                attempt.get(
                    "attempts",
                    1
                ) or 1
            )

            solved = bool(
                attempt.get(
                    "solved",
                    False
                )
            )

            attempts += session_attempts

            if solved:
                successes += 1

        success_rate = (
            successes / attempts
            if attempts > 0
            else 0.0
        )

        problem_stats[
            normalize_problem_key(title)
        ] = {
            "title": title,
            "difficulty": problem.get(
                "difficulty",
                "Unknown"
            ),
            "tags": tags,
            "attempts": attempts,
            "successes": successes,
            "success_rate": success_rate,
        }

        # --------------------------------------------------
        # Topic statistics
        # --------------------------------------------------

        for topic in tags:

            topic = str(topic).strip()

            if not topic:
                continue

            if topic not in topic_stats:

                topic_stats[topic] = {
                    "attempts": 0,
                    "successes": 0,
                }

            topic_stats[topic]["attempts"] += attempts
            topic_stats[topic]["successes"] += successes

    # --------------------------------------------------
    # 2. Calculate topic weakness
    # --------------------------------------------------

    max_weakness_score = 0.0

    for topic, stats in topic_stats.items():

        attempts = stats["attempts"]

        success_rate = (
            stats["successes"] / attempts
            if attempts > 0
            else 0.0
        )

        stats["success_rate"] = success_rate

        stats["weakness_score"] = (
            (1 - success_rate)
            * math.log1p(attempts)
        )

        max_weakness_score = max(
            max_weakness_score,
            stats["weakness_score"]
        )

    # --------------------------------------------------
    # 3. Use complete catalog as recommendation pool
    # --------------------------------------------------

    candidates = {}

    for catalog_problem in catalog:

        title = str(
            catalog_problem.get(
                "title",
                ""
            )
        ).strip()

        if not title:
            continue

        candidates[
            normalize_problem_key(title)
        ] = {
            "title": title,
            "topic": catalog_problem.get(
                "topic",
                "Uncategorized"
            ),
            "difficulty": catalog_problem.get(
                "difficulty",
                "Unknown"
            ),
        }

    # Also keep custom MongoDB problems
    # not present in the catalog.

    for key, stats in problem_stats.items():

        if key not in candidates:

            candidates[key] = {
                "title": stats["title"],
                "topic": (
                    stats["tags"][0]
                    if stats["tags"]
                    else "Uncategorized"
                ),
                "difficulty": stats[
                    "difficulty"
                ],
            }

    # --------------------------------------------------
    # 4. Score every candidate
    # --------------------------------------------------

    recommendations = []

    for candidate in candidates.values():

        title = candidate["title"]

        key = normalize_problem_key(title)

        history = problem_stats.get(key)

        # --------------------------------------------------
        # Student history for this problem
        # --------------------------------------------------

        if history:

            attempts = history["attempts"]

            successes = history["successes"]

            success_rate = history[
                "success_rate"
            ]

            tags = history["tags"]

        else:

            attempts = 0
            successes = 0
            success_rate = 0.0

            tags = [
                candidate["topic"]
            ]

        # --------------------------------------------------
        # ML prediction
        # --------------------------------------------------

        features = build_student_features(
            problems,
            target_problem_title=title
        )

        feature_values = [[
            features["previous_attempts"],
            features["previous_success_rate"],
            features["recent_success_rate_5"],
            features["previous_problem_attempts"],
            features["previous_problem_success_rate"],
            features["hour"],
            features["day_of_week"],
            features["days_since_first_submission"],
        ]]

        prediction = predict_success(
            feature_values
        )

        success_probability = (
            prediction[
                "success_probability"
            ]
        )

        # --------------------------------------------------
        # Topic weakness
        # --------------------------------------------------

        topic_scores = []

        for topic in tags:

            topic = str(topic).strip()

            if topic in topic_stats:

                topic_scores.append(
                    topic_stats[topic][
                        "weakness_score"
                    ]
                )

        raw_weakness_score = (
            max(topic_scores)
            if topic_scores
            else 0.0
        )

        if max_weakness_score > 0:

            weakness_score = (
                raw_weakness_score
                / max_weakness_score
            )

        else:

            weakness_score = 0.0

        # --------------------------------------------------
        # Repeated failure priority
        # --------------------------------------------------

        if attempts > 0:

            failure_rate = (
                1 - success_rate
            )

            repeated_failure_score = (
                failure_rate
                * min(
                    attempts / 3,
                    1.0
                )
            )

        else:

            failure_rate = 0.0
            repeated_failure_score = 0.0

        # --------------------------------------------------
        # Exploration / cold-start bonus
        # --------------------------------------------------

        is_unexplored = (
            attempts == 0
        )

        exploration_bonus = (
            1.0
            if is_unexplored
            else 0.0
        )

        # --------------------------------------------------
        # Cold-start learning progression
        # --------------------------------------------------

        if not problems and is_unexplored:

            try:

                topic_position = (
                    COLD_START_TOPIC_ORDER.index(
                        candidate["topic"]
                    )
                )

            except ValueError:

                topic_position = len(
                    COLD_START_TOPIC_ORDER
                )

            cold_start_score = (
                1
                - (
                    topic_position
                    / len(
                        COLD_START_TOPIC_ORDER
                    )
                )
            )

        else:

            cold_start_score = 0.0

        # --------------------------------------------------
        # ML challenge fit
        # --------------------------------------------------

        challenge_fit = max(
            0.0,
            1
            - abs(
                success_probability - 0.60
            ) / 0.60
        )

        # --------------------------------------------------
        # Final recommendation score
        # --------------------------------------------------

        recommendation_score = (
            0.45
            * repeated_failure_score

            + 0.25
            * weakness_score

            + 0.15
            * challenge_fit

            + 0.10
            * exploration_bonus

            + 0.05
            * (1 - success_rate)

            + 0.20
            * cold_start_score
        )

        # --------------------------------------------------
        # Explanation
        # --------------------------------------------------

        if (
            attempts > 0
            and successes == 0
        ):

            history_reason = (
                f"You have attempted this "
                f"problem {attempts} times "
                f"but have not solved it "
                f"successfully yet."
            )

            if attempts >= 3:
                priority = "Critical"
            else:
                priority = "High"

        elif (
            attempts > 0
            and success_rate < 0.5
        ):

            history_reason = (
                "Your success rate on this "
                "problem is below 50%."
            )

            priority = "High"

        elif is_unexplored:

            if not problems:

                history_reason = (
                    "You're just getting started. "
                    "This problem is part of a "
                    "recommended DSA learning path."
                )

            else:

                history_reason = (
                    "You have not attempted this "
                    "problem yet, so it gives you "
                    "a chance to explore this area."
                )

            priority = "Explore"

        else:

            history_reason = (
                "This problem can reinforce "
                "your existing knowledge."
            )

            priority = "Practice"

        # --------------------------------------------------
        # ML explanation
        # --------------------------------------------------

        if success_probability >= 0.75:

            prediction_reason = (
                "The ML model predicts a "
                "relatively high chance "
                "of success."
            )

        elif success_probability >= 0.50:

            prediction_reason = (
                "The ML model predicts a "
                "manageable challenge."
            )

        else:

            prediction_reason = (
                "The ML model predicts that "
                "this may be challenging "
                "right now."
            )

        # --------------------------------------------------
        # Add recommendation
        # --------------------------------------------------

        recommendations.append({

            "title": title,

            "difficulty": candidate[
                "difficulty"
            ],

            "topic": candidate[
                "topic"
            ],

            "attempts": attempts,

            "successes": successes,

            "success_rate": success_rate,

            "success_probability": (
                success_probability
            ),

            "weakness_score": (
                weakness_score
            ),

            "repeated_failure_score": (
                repeated_failure_score
            ),

            "exploration_bonus": (
                exploration_bonus
            ),

            "cold_start_score": (
                cold_start_score
            ),

            "challenge_fit": (
                challenge_fit
            ),

            "failure_rate": (
                failure_rate
            ),

            "recommendation_score": (
                recommendation_score
            ),

            "priority": priority,

            "reason": (
                f"{history_reason} "
                f"{prediction_reason}"
            ),
        })

    # --------------------------------------------------
    # 5. Sort by recommendation score
    # --------------------------------------------------

    recommendations.sort(
        key=lambda item: item[
            "recommendation_score"
        ],
        reverse=True
    )

    # --------------------------------------------------
    # 6. Topic diversity
    # --------------------------------------------------

    selected = []

    selected_topics = set()

    # First priority:
    # repeated failures.

    for recommendation in recommendations:

        if (
            recommendation[
                "repeated_failure_score"
            ] > 0
        ):

            selected.append(
                recommendation
            )

            selected_topics.add(
                recommendation["topic"]
            )

            if len(selected) >= top_n:

                return selected

    # Second priority:
    # different topics.

    for recommendation in recommendations:

        if recommendation in selected:
            continue

        topic = recommendation[
            "topic"
        ]

        if topic not in selected_topics:

            selected.append(
                recommendation
            )

            selected_topics.add(topic)

            if len(selected) >= top_n:

                return selected

    # Final fallback.

    for recommendation in recommendations:

        if recommendation in selected:
            continue

        selected.append(
            recommendation
        )

        if len(selected) >= top_n:
            break

    return selected