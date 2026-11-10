import json
import re
from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent

QUESTIONS_PATH = (
    BASE_DIR
    / "dataset"
    / "raw"
    / "tst_questions.csv"
)

OUTPUT_PATH = (
    BASE_DIR
    / "data"
    / "problems_catalog.json"
)


def normalize_text(text):
    return re.sub(
        r"[^a-z0-9\s]",
        " ",
        str(text).lower()
    ).strip()


def classify_topic(question):
    """
    Map each dataset problem to the same
    broad DSA topic categories used by CodeMentor.
    """

    q = normalize_text(question)

    # Trees / BST
    if any(word in q for word in [
        "tree",
        "bst",
        "binary tree",
        "binary search tree",
        "traversal",
        "ancestor",
        "subtree",
        "leaf",
    ]):
        return "Trees / BST"

    # Graphs
    if any(word in q for word in [
        "graph",
        "dfs",
        "bfs",
        "vertex",
        "vertices",
        "edge",
        "edges",
        "path",
        "dijkstra",
    ]):
        return "Graphs"

    # Linked List
    if any(word in q for word in [
        "linked list",
        "link list",
        "node",
        "reverse list",
        "cycle",
    ]):
        return "Linked List"

    # Stack
    if any(word in q for word in [
        "stack",
        "parentheses",
        "bracket",
        "brackets",
    ]):
        return "Stack"

    # Queue
    if any(word in q for word in [
        "queue",
        "deque",
    ]):
        return "Queue"

    # Heap
    if any(word in q for word in [
        "heap",
        "priority queue",
        "min heap",
        "max heap",
    ]):
        return "Heap"

    # Hashing
    if any(word in q for word in [
        "hash",
        "hashmap",
        "hash map",
        "dictionary",
        "frequency map",
    ]):
        return "Hashing"

    # Searching
    if any(word in q for word in [
        "binary search",
        "search",
        "find element",
        "lower bound",
        "upper bound",
    ]):
        return "Searching"

    # Sorting
    if any(word in q for word in [
        "sort",
        "sorting",
        "merge sort",
        "quick sort",
        "insertion sort",
        "selection sort",
        "bubble sort",
    ]):
        return "Sorting"

    # Recursion
    if any(word in q for word in [
        "recursion",
        "recursive",
        "recursive function",
        "backtracking",
    ]):
        return "Recursion"

    # Partitioning
    if any(word in q for word in [
        "partition",
        "partitioning",
    ]):
        return "Partitioning"

    # String / Text
    if any(word in q for word in [
        "string",
        "substring",
        "text",
        "palindrome",
        "character",
    ]):
        return "String / Text"

    # Math / Theory
    if any(word in q for word in [
        "prime",
        "factorial",
        "fibonacci",
        "gcd",
        "lcm",
        "mathematical",
        "math",
    ]):
        return "Math / Theory"

    # Known manual classifications
    manual_topics = {
        "down_n": "Sorting",
        "leftover_element": "Arrays",
        "mariana_and_books": "Sorting",
        "move_impostor": "Sorting",
        "move_n": "Sorting",
        "move_three": "Sorting",
        "plates_sorting": "Sorting",
        "warm_up_dsa": "Arrays",
    }

    if q in manual_topics:
        return manual_topics[q]

    # Default
    return "Arrays"


# --------------------------------------------------
# Load questions
# --------------------------------------------------

questions = pd.read_csv(
    QUESTIONS_PATH,
    sep="~",
    quotechar='"',
    engine="python"
)

print(f"Loaded {len(questions)} questions.")


# --------------------------------------------------
# Build catalog
# --------------------------------------------------

catalog = []

for _, row in questions.iterrows():

    title = str(row["question"]).strip()

    if not title:
        continue

    topic = classify_topic(title)

    catalog.append({
        "title": title,
        "topic": topic,
        "difficulty": "Unknown"
    })


# Remove duplicate titles
unique_catalog = {}

for problem in catalog:
    unique_catalog[
        problem["title"].lower()
    ] = problem

catalog = list(unique_catalog.values())


# --------------------------------------------------
# Save
# --------------------------------------------------

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

with open(
    OUTPUT_PATH,
    "w",
    encoding="utf-8"
) as file:
    json.dump(
        catalog,
        file,
        indent=2,
        ensure_ascii=False
    )


print(
    f"Saved {len(catalog)} problems to:"
    f"\n{OUTPUT_PATH}"
)
