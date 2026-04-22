🚀 XcelCrowd: Next In Line ATS
A Hiring Pipeline That Moves Itself.

XcelCrowd is an automated recruitment pipeline designed to eliminate the manual overhead of queue management. Built with a "Self-Healing" philosophy, the system ensures that when a spot opens up, the next best candidate is promoted instantly, maintaining a fluid and transparent hiring experience.

🛠 Tech Stack (PERN)
Frontend: React.js (Vite) — Utilizing React Router for role-based interface separation.

Backend: Node.js & Express — Optimized with modular route handling.

Database: PostgreSQL — Utilizing Row-Level Locking for enterprise-grade concurrency.

AI Integration: Google Gemini Pro — (Planned) Intelligent JD-to-Resume scoring for priority ranking.

🏗 Key Features
1️⃣ Role-Based Interface Separation
Unlike standard monolithic apps, XcelCrowd provides distinct entry points for different users:

Candidate Portal (/candidate): A streamlined interface for applications and status tracking.

Recruiter Dashboard (/recruiter): A high-level command center for candidate auditing and pipeline control.

2️⃣ Gapless "Self-Healing" Queue
The system implements a sophisticated re-indexing algorithm. If a candidate at "Waitlist #2" is rejected, the system automatically shifts "Waitlist #3" into the #2 slot, ensuring the queue remains a perfect sequence (1, 2, 3...) without fragmentation.

3️⃣ Atomic Concurrency Safety
Designed for high-traffic scenarios, the backend prevents "race conditions" where two users might grab the same final slot simultaneously.

📅 Development Progress & Milestones
✅ Phase 1: Database Architecture & Handshake
Initialized recruitment_db with relational integrity across applicants and logs.

Established a stable bridge between Express and Postgres using pg pooling.

Milestone: Verified /health route and pgAdmin 4 visual auditing.

✅ Phase 2: The Autonomous Queue (Completed: April 20, 2026)
Capacity Control: The system automatically sorts applicants into ACTIVE or WAITLISTED based on job-specific limits.

Row-Level Locking: Used SELECT ... FOR UPDATE to lock job records during capacity calculations, ensuring data consistency.

✅ Phase 3: Auto-Promotion & Re-indexing (Completed: April 22, 2026)
Chain Reaction: Developed a PATCH trigger where rejecting an ACTIVE candidate automatically promotes the #1 person from the waitlist.

Dynamic Re-indexing: Implemented a recursive shift that corrects waitlist positions immediately upon any status change.

⚙️ Core Logic & Requirements Fulfillment
🛡️ Concurrency (Requirement #5)
To handle simultaneous applications for the last spot:

Transactions: We use PostgreSQL Transactions (BEGIN / COMMIT).

Row Locking: We invoke SELECT ... FOR UPDATE on the Job record. This ensures concurrent requests process sequentially, preventing capacity over-runs.

📉 Inactivity Decay & Penalty (Requirement #7)
Decay Window: 24 Hours.

Trigger: A background worker monitors ACTIVE users who have not acknowledged their promotion.

Penalty Logic: Unresponsive users aren't deleted; they are moved to the end of the waitlist (MAX(pos) + 1) and their penalty_count is incremented.

The Cascade: Upon decay, the next person in line is promoted automatically without manual intervention.

🕵️ Traceability (Requirement #6)
Every movement—from initial application to automated promotion or decay—is recorded in the pipeline_logs table. This allows recruiters to reconstruct the exact history of the hiring line at any time.
