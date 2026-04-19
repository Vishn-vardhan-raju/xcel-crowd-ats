# 🚀 XcelCrowd: Next In Line ATS

> **Build a Hiring Pipeline That Moves Itself.**

---

## 📌 Project Overview

**XcelCrowd** is a lightweight, automated recruitment pipeline designed specifically for small engineering teams. This system replaces messy spreadsheets with an **Autonomous Queue**, ensuring the hiring pipeline remains full and active without human intervention.

## 🛠 Tech Stack (PERN)

- **Frontend:** `React.js` (Vite)
- **Backend:** `Node.js` & `Express`
- **Database:** `PostgreSQL` (Relational integrity for queue management)
- **AI Integration:** `Google Gemini Pro` (Intelligent JD-to-Resume scoring)
- **Infrastructure:** Local development with `.env` configuration

---

## 📅 Development Progress

### ✅ Day 1-2: Foundation

- Initialized PostgreSQL `recruitment_db`.
- Designed schema with tables for `applicants`, `jobs`, and `audit_logs`.
- Set up Node/Express backend with database pooling (`pg`).

### ✅ Day 3: API & Connectivity

- **Live Database Connection:** Established a stable bridge between Express and Postgres.
- **RESTful Endpoints:** - `POST /api/apply`: Validates and saves applicant data directly to the database.
  - `GET /api/applicants`: Fetches and displays all applications in real-time.
- **Data Integrity:** Implemented server-side validation to prevent empty or malformed entries.

---

## 🚀 Core Features & Logic (Coming Soon)

### 1️⃣ Capacity-Based Pipeline

- **Active State:** Applicants currently being reviewed.
- **Waitlist State:** Beyond capacity enter a queue.
- **Auto-Promotion:** Hires/Rejections trigger the next person in line.

### 2️⃣ Inactivity Decay

- Applicants have a **24-hour window** to acknowledge promotion.
- **Penalty:** Failure to respond moves them back **5 positions** in the waitlist.

---

## 🏗 Architectural Decisions

- **PostgreSQL Transactions:** Using `SELECT ... FOR UPDATE` to handle high-concurrency application spikes.
- **Audit Logs:** Full traceability for every state transition to ensure the "Self-Moving" logic is reconstructible.

---

## 🚦 Setup Instructions

1. **Clone the repo:** `git clone https://github.com/Vishn-vardhan-raju/xcel-crowd-ats`
2. **Backend:** `cd backend && npm install`
3. **Frontend:** `cd frontend && npm install`
4. **Environment:** Setup `.env` in the backend folder with:
   - `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST`, `DB_PORT`
5. **Run:** `npm run dev`

### ✅ Day 4-6: System Hardening

Schema Finalization: Refined audit_logs and jobs tables for better relational integrity.

Environment Optimization: Resolved psql path issues and configured .env variables for modularity.

Backend Refactoring: Cleaned up server logic and implemented better error handling for DB connection failures.

### Day 7: Database Synchronization & Backend Verification

Milestone: Successful integration of pgAdmin 4 for visual data auditing and backend-to-database handshake.

Technical Work:

PostgreSQL Connectivity: Established a visual connection between the local server and pgAdmin 4, enabling real-time monitoring of table states.

Data Integrity: Validated the applicants table schema, ensuring data types (VARCHAR, SERIAL, TIMESTAMP) align with the backend's model requirements.

Manual Transaction Testing: Executed raw SQL INSERT and SELECT queries to verify that the database correctly handles default values (e.g., status defaulting to 'applied').

Endpoint Resolution: Debugged the localhost:5000 connectivity issues, moving from "Connection Refused" to a successful "Cannot GET /" (confirming the server is listening) and finally verifying the /health route.
