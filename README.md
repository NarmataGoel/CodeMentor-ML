# 🧠 CodeMentor ML

> **An ML-powered DSA learning assistant that learns from your practice history, predicts problem-solving success, identifies weak areas, and recommends what you should practice next.**

🌐 **Live Demo:** https://code-mentor-ml.vercel.app  

---

## 🚀 What is CodeMentor ML?

Most DSA platforms tell you **what problems you solved**.

CodeMentor ML tries to answer a more useful question:

> **"What should I practice next, and how likely am I to solve it?"**

CodeMentor analyzes a student's historical coding activity and combines:

- Previous attempts
- Historical success rate
- Recent performance
- Problem-specific experience
- Repeated failures
- Topic-level weaknesses
- Exploration of topics the student has not practiced
- ML-predicted probability of success

The system then uses these signals to recommend problems that are appropriate for the student's current learning state.

So instead of simply saying:

> "You are weak at Sorting."

CodeMentor can say:

> **"You have repeatedly struggled with Sorting. Try this problem next because its predicted difficulty is appropriate for your current performance."**

---

# ✨ Key Features

### 🤖 ML-Based Performance Prediction

CodeMentor uses a **Random Forest classifier** to estimate the probability that a student will successfully solve a problem.

The model uses behavioral features such as:

- Previous attempts
- Previous success rate
- Recent success rate
- Previous attempts on the same problem
- Previous success rate on the same problem
- Time of day
- Day of week
- Days since the student's first submission

Example:

```text
Problem: Binary Search

Predicted success probability: 67.4%

→ Moderate challenge
→ Review the topic briefly, then attempt it
```

---

### 📊 Weak Topic Detection

The system analyzes performance by DSA topic.

For each student/topic combination, it considers:

```text
Attempts
Successes
Success Rate
Weakness Score
```

The weakness score gives more importance to areas where the student has:

- Low success rate
- Multiple attempts

This prevents a single unsuccessful attempt from incorrectly labeling an entire topic as weak.

---

### 🎯 Personalized Recommendations

Recommendations are not simply based on the topics a student has already attempted.

The recommendation engine considers:

```text
Repeated failures
        +
Topic weakness
        +
ML challenge fit
        +
Exploration needs
        +
Historical performance
        ↓
Personalized recommendation
```

A student who repeatedly fails a problem can receive a **Critical** recommendation.

A completely new student can still receive recommendations through a **cold-start learning progression**.

---

### 🌱 Cold-Start Recommendations

A new student has no historical data.

Instead of returning:

> "Not enough data."

CodeMentor provides a learning progression beginning with foundational topics such as:

```text
Arrays
↓
Searching
↓
Sorting
↓
Linked Lists
↓
Stack / Queue
↓
Recursion
↓
Hashing
↓
Trees
↓
Heap
↓
Graphs
```

This allows the recommendation system to work even when a student has little or no history.

---

### 💾 Persistent Practice History

Practice data is stored in **MongoDB Atlas** rather than only in browser storage.

Each practice session can preserve information such as:

```json
{
  "title": "Binary Search",
  "attempts": 2,
  "status": "Solved",
  "timeTaken": 18,
  "attemptHistory": [
    {
      "attempts": 1,
      "solved": false,
      "timeTaken": 25
    },
    {
      "attempts": 1,
      "solved": true,
      "timeTaken": 18
    }
  ]
}
```

This history provides the behavioral information used by the ML and recommendation components.

---

# 🧠 Machine Learning Pipeline

The ML pipeline was built using the **DSA Dataset – Zenodo**, containing historical programming submissions.

```text
                    DSA Dataset
                         │
                         ▼
                Data Preprocessing
                         │
                         ▼
                Feature Engineering
                         │
                         ▼
              Chronological Train/Test
                         │
                         ▼
                 Random Forest
                         │
                         ▼
             Success Probability
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
       Weakness Analysis       Recommendation Engine
             │                       │
             └───────────┬───────────┘
                         ▼
                    FastAPI API
                         │
                         ▼
                    React Frontend
```

---

# 📚 Dataset

The project uses the **DSA Dataset – Zenodo**.

Dataset source:

https://zenodo.org/records/18136250

The dataset contains historical Java submissions and DSA questions.

After preprocessing:

- **16,074** raw submissions
- **15,474** valid success/failure submissions
- **15,093** final ML records after timestamp cleaning
- **270** students
- **99** problems

The target variable is:

```text
1 → Successful submission
0 → Failed submission
```

---

# 🔬 Feature Engineering

The model uses behavioral features rather than directly using the current submission result.

### Student-level features

```text
previous_attempts
previous_success_rate
recent_success_rate_5
```

### Problem-level features

```text
previous_problem_attempts
previous_problem_success_rate
```

### Temporal features

```text
hour
day_of_week
days_since_first_submission
```

The dataset is ordered chronologically so that information from future submissions does not leak into earlier predictions.

---

# 📈 Model Performance

Several models and feature configurations were evaluated.

The final model is a **Random Forest Classifier**.

### Final test performance

| Metric | Score |
|---|---:|
| Accuracy | **64.2%** |
| Precision | **62.9%** |
| Recall | **67.6%** |
| F1 Score | **65.2%** |
| ROC-AUC | **0.696** |

The final evaluation was performed on a **chronological held-out test set**.

This is important because the model is intended to predict future student behavior rather than memorize randomly shuffled historical records.

### Why Random Forest?

Random Forest was selected because it:

- Handles nonlinear relationships
- Works well with mixed behavioral features
- Requires relatively little feature scaling
- Provides feature importance
- Performs better than the baseline Logistic Regression model on this task

---

# 🎯 Recommendation Engine

The recommendation engine combines multiple signals.

Conceptually:

```text
Recommendation Score
=
Repeated Failure
+ Topic Weakness
+ Challenge Fit
+ Exploration
+ Historical Performance
+ Cold-Start Signal
```

The current scoring system gives the strongest influence to repeated failures and topic weakness while also considering whether a problem is an appropriate challenge.

### Recommendation priorities

```text
Critical
High
Explore
```

For example:

```text
3 attempts
0 successful solutions
        ↓
Repeated Failure Signal
        ↓
Critical Recommendation
```

This makes the recommendation system more adaptive than a simple:

```text
if weak_topic:
    recommend_problem()
```

---

# 🏗️ System Architecture

```text
┌───────────────────────────────┐
│       React + Vite Frontend   │
│                               │
│ Dashboard                     │
│ Practice Tracking             │
│ Weak Topics                   │
│ Recommendations               │
│ Analytics                     │
└───────────────┬───────────────┘
                │
                │ HTTP / REST API
                ▼
┌───────────────────────────────┐
│          FastAPI              │
│                               │
│ /predict                      │
│ /recommendations              │
│ /weak-topics                  │
│ /problems                     │
│ /health                       │
│ /db-health                    │
└───────────────┬───────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
┌───────────────┐  ┌─────────────────┐
│ Random Forest │  │  MongoDB Atlas  │
│ ML Model      │  │                 │
│               │  │ Practice Data   │
└───────────────┘  └─────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

- React
- Vite
- JavaScript
- React Router
- CSS

## Backend

- Python
- FastAPI
- Uvicorn
- Pydantic

## Machine Learning

- Python
- Pandas
- NumPy
- Scikit-learn
- Random Forest
- Joblib
- Jupyter Notebook

## Database

- MongoDB Atlas
- PyMongo

## Deployment

- **Vercel** — React frontend
- **Render** — FastAPI backend
- **MongoDB Atlas** — database

---

# 📁 Project Structure

```text
CodeMentor-ML/
│
├── backend/
│   │
│   ├── app/
│   │   ├── main.py
│   │   ├── model.py
│   │   ├── database.py
│   │   ├── features.py
│   │   ├── weakness.py
│   │   └── recommendations.py
│   │
│   ├── data/
│   │   └── problems_catalog.json
│   │
│   ├── dataset/
│   │   └── raw/
│   │       ├── java_submissions.csv
│   │       ├── tst_questions.csv
│   │       └── distribution_per_question.csv
│   │
│   ├── models/
│   │   └── performance_model.pkl
│   │
│   ├── notebook/
│   │   └── 01_explore_dataset.ipynb
│   │
│   ├── create_catalog.py
│   ├── requirements.txt
│   └── .python-version
│
├── frontend/
│   └── leetcodeTracker/
│       ├── src/
│       │   ├── components/
│       │   ├── components1/
│       │   ├── context/
│       │   ├── services/
│       │   └── utils/
│       │
│       ├── package.json
│       └── vite.config.js
│
└── README.md
```

---

# ⚙️ Running Locally

## 1. Clone the repository

```bash
git clone https://github.com/NarmataGoel/CodeMentor-ML.git
cd CodeMentor-ML
```

---

## 2. Backend setup

Create/activate the Python environment:

```bash
conda activate E:\conda_envs\codementor
```

Move into the backend:

```bash
cd backend
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DATABASE=codementor
FRONTEND_URL=http://localhost:5173
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

The API will run at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 3. Frontend setup

Open another terminal:

```bash
cd frontend/leetcodeTracker
```

Install dependencies:

```bash
npm install
```

Create:

```text
.env
```

with:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Start the frontend:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

---

# 🔐 Environment Variables

Never commit secrets to Git.

### Backend

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DATABASE=codementor
FRONTEND_URL=http://localhost:5173
```

### Frontend

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Production deployments use environment variables configured directly in Render and Vercel.

---

# 🌐 Production Deployment

The current application is deployed using:

```text
                 Internet
                    │
                    ▼
        ┌─────────────────────┐
        │       Vercel        │
        │   React Frontend    │
        └──────────┬──────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │       Render        │
        │   FastAPI Backend   │
        └──────────┬──────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │   MongoDB Atlas     │
        │   Persistent Data   │
        └─────────────────────┘
```

### Live Application

https://code-mentor-ml.vercel.app

### Backend

The FastAPI backend is deployed separately on Render.

---

# 🧪 API Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /` | API information |
| `GET /health` | Backend health check |
| `GET /db-health` | MongoDB connectivity check |
| `POST /predict` | Predict success probability |
| `POST /predict/{user_id}` | Predict for a student's problem |
| `GET /problems` | Retrieve practice problems |
| `PUT /problems/{problem_id}` | Update a problem |
| `DELETE /problems/{problem_id}` | Delete a problem |
| `GET /weak-topics/{user_id}` | Analyze weak topics |
| `GET /recommendations/{user_id}` | Generate personalized recommendations |

FastAPI automatically provides interactive API documentation through:

```text
/docs
```

---

# 💡 What Makes This Project Interesting?

CodeMentor ML combines several areas of software engineering into one application:

```text
Data Engineering
       +
Machine Learning
       +
Feature Engineering
       +
Recommendation Systems
       +
REST APIs
       +
Database Engineering
       +
React
       +
Cloud Deployment
```

The interesting part is that the ML model is not isolated inside a notebook.

It is integrated into a complete application:

```text
Student Practice
       ↓
MongoDB
       ↓
Feature Construction
       ↓
ML Prediction
       ↓
Weakness Analysis
       ↓
Recommendation Engine
       ↓
Personalized Learning
```

This turns the project from a simple ML experiment into an **end-to-end ML application**.

---

# 🚧 Limitations

The current model is designed as a learning-oriented prediction system rather than a production-grade assessment model.

Some limitations include:

- The dataset contains a relatively small number of unique problems.
- The training data primarily represents Java submissions.
- Difficulty labels are not directly available in the dataset.
- Application-side features are reconstructed from practice history rather than raw submission logs.
- The model's performance is moderate rather than highly accurate.
- Recommendation quality can improve with more user interaction data.

These limitations also provide opportunities for future development.

---

# 🔮 Future Improvements

Potential improvements include:

### 🤖 Better ML models

Experiment with:

- XGBoost
- LightGBM
- Gradient Boosting
- Neural networks

### 🧠 Sequence-based student modeling

Use models such as:

```text
RNN
LSTM
Transformer
```

to model the sequence of problems solved by a student.

### 🎯 More advanced recommendations

A future recommendation engine could optimize for:

```text
Learning gain
+
Difficulty progression
+
Topic coverage
+
Student engagement
```

rather than only predicted success.

### 📈 Online learning

Allow the model to update as new student practice data becomes available.

### 🔎 Explainable predictions

Show students why a problem received a particular recommendation:

```text
Recommended because:

✓ You struggled with Sorting recently
✓ You have attempted similar problems
✓ Your predicted success probability is moderate
✓ This problem helps strengthen the weak area
```

---

# 👩‍💻 Author

**Namrata Goel**

Built as an end-to-end machine learning and software engineering project focused on personalized DSA learning.

---

## ⭐ If you find the project interesting

Feel free to explore the repository, try the live application, or use the architecture as inspiration for building your own ML-powered learning system.