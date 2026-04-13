# 🚀 XcelCrowd: Next In Line ATS
> **Build a Hiring Pipeline That Moves Itself.**

---

## 📌 Project Overview
**XcelCrowd** is a lightweight, automated recruitment pipeline designed specifically for small engineering teams. Traditional ATS platforms are often too expensive and manually intensive. This system replaces messy spreadsheets with an **Autonomous Queue**, ensuring that the hiring pipeline remains full and active without human intervention.

## 🛠 Tech Stack (PERN)
* **Frontend:** `React.js` (Vite)
* **Backend:** `Node.js` & `Express`
* **Database:** `PostgreSQL` (Relational integrity for queue management)
* **AI Integration:** `Google Gemini Pro` (Intelligent JD-to-Resume scoring)
* **Infrastructure:** Local development with `.env` configuration

---

## 🚀 Core Features & Logic

### 1️⃣ Capacity-Based Pipeline
Companies define an **Active Capacity** (e.g., only 5 people interviewed at once).
* **Active State:** Applicants currently being reviewed.
* **Waitlist State:** Applications beyond capacity enter a queue (not a rejection).
* **Auto-Promotion:** When an active applicant is hired or rejected, the system automatically promotes the next person in the waitlist.

### 2️⃣ Inactivity Decay (The "Self-Moving" Pipeline)
To prevent the pipeline from stalling:
* When promoted to **Active**, an applicant has a **24-hour window** to acknowledge.
* **Penalty:** If they fail to respond, they move back **5 positions** in the waitlist.
* The system then automatically promotes the next candidate in line.

### 3️⃣ Traceability & Logs
Every state transition (Applied → Waitlisted → Active → Decay) is logged with a timestamp in a dedicated `audit_logs` table for full reconstructability.

---

## 🏗 Architectural Decisions

### ⚔️ Handling Concurrency (Requirement #5)
**The Challenge:** Two applications arriving at the exact same millisecond for the last "Active" spot.
**The Strategy:** I implemented **PostgreSQL Database Transactions**. By using `SELECT ... FOR UPDATE`, the backend locks the job's capacity count during the write process. This ensures only one applicant claims the spot, while the other is assigned the first waitlist position, preventing "Over-Capacity" bugs.

### 🖥 Minimalist Frontend
* **Admin Dashboard:** Current pipeline state and capacity controls.
* **Applicant Tracking:** Real-time queue position and status tracking.

---

## 🚦 Setup Instructions
1.  **Clone the repo:** ```bash
    git clone [https://github.com/Vishn-vardhan-raju/xcel-crowd-ats](https://github.com/Vishn-vardhan-raju/xcel-crowd-ats)
    ```
2.  **Backend:** `cd backend && npm install`
3.  **Frontend:** `cd frontend && npm install`
4.  **Environment:** Setup `.env` with `DATABASE_URL` and `GEMINI_API_KEY`.
5.  **Run:** `npm run dev`

---

## 🔮 Future Improvements
* Implement **WebSockets** for real-time "Queue Position" notifications.
* Integrate **Agentic AI** to pre-screen candidates based on GitHub activity.
