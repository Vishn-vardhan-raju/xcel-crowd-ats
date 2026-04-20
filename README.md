# 🚀 XcelCrowd: Next In Line ATS

> **A Hiring Pipeline That Moves Itself.**

**XcelCrowd** is an automated recruitment pipeline designed to eliminate the manual overhead of queue management. Built with a "Self-Healing" philosophy, the system ensures that when a spot opens up, the next best candidate is promoted instantly.

---

## 🛠 Tech Stack (PERN)

- **Frontend:** `React.js` (Vite) — _In Progress_
- **Backend:** `Node.js` & `Express`
- **Database:** `PostgreSQL` (Utilizing Row-Level Locking for concurrency)
- **AI Integration:** `Google Gemini Pro` (Future: Intelligent JD-to-Resume scoring)

---

## 📅 Development Progress & Milestones

### ✅ Phase 1: Database Architecture & Handshake

- Initialized `recruitment_db` with relational integrity.
- Established a stable bridge between Express and Postgres using `pg` pooling.
- **Milestone:** Verified /health route and pgAdmin 4 visual auditing.

### ✅ Phase 2: The Autonomous Queue (Completed: April 20, 2026)

- **Atomic Transactions:** Implemented `BEGIN/COMMIT` logic to handle high-concurrency applications.
- **Capacity Control:** The system automatically sorts applicants into `ACTIVE` or `WAITLISTED` based on job-specific limits.
- **Row-Level Locking:** Used `SELECT ... FOR UPDATE` to prevent "race conditions" during peak application spikes.

### ✅ Phase 3: Auto-Promotion Logic (Completed: April 20, 2026)

- **Chain Reaction:** Developed a `PATCH` trigger where rejecting an `ACTIVE` candidate automatically promotes the `#1` person from the waitlist.
- **Queue Shifting:** Implemented mathematical position shifting ($2 \rightarrow 1$) to keep the line moving dynamically.

---

## 🏗 Key Features

### 1️⃣ Self-Managing Pipeline

The "Brain" of XcelCrowd handles the logistics. If a recruiter rejects a candidate, the system doesn't wait—it immediately fills the vacancy from the waitlist.

### 2️⃣ Concurrency Safety

Designed for engineering teams, the backend is built to handle multiple simultaneous applications without doubling up on queue positions or exceeding capacity.

### 3️⃣ (Upcoming) Gemini AI Scoring

Integrating Google Gemini to provide a "Compatibility Score," helping recruiters prioritize who gets the `ACTIVE` spots first.

---

## 🚦 Setup Instructions

1.  **Clone the repo:**
    ```bash
    git clone [https://github.com/Vishn-vardhan-raju/pern-recruitment-app.git](https://github.com/Vishn-vardhan-raju/pern-recruitment-app.git)
    ```
2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    ```
3.  **Environment Configuration:**
    Create a `.env` file in the `backend` folder:
    ```env
    DB_USER=postgres
    DB_PASSWORD=your_password
    DB_NAME=recruitment_db
    DB_HOST=localhost
    DB_PORT=5432
    DATABASE_URL=postgres://postgres:password@localhost:5432/recruitment_db
    ```
4.  **Database Seeding:**
    ```bash
    node seed.js
    ```
5.  **Run Server:**
    ```bash
    node server.js
    ```

---

## 📝 Author

**T Vishnu Vardhan Raju**
_Information Technology Student | Telangana, India_
[GitHub](https://github.com/Vishn-vardhan-raju) | [HackerRank](https://www.hackerrank.com/tangellavishnu)
