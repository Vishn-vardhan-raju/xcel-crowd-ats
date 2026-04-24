🚀 XcelCrowd: Autonomous Next-In-Line ATS
A Hiring Pipeline That Moves Itself.

XcelCrowd is an automated recruitment engine designed to eliminate the manual overhead of queue management. Built with a "Self-Healing" philosophy, the system ensures that when a spot opens up, the next best candidate is promoted instantly, maintaining a fluid, transparent, and fair hiring experience without manual intervention.

🏗 System Architecture & Requirements Fulfillment

1. The "Active Pool" & Waitlist (Requirements #1, #2)
   The system maintains a strict Active Capacity of 3.

The first 3 applicants are automatically assigned the ACTIVE status.

Any subsequent applicants are assigned to the Waitlist with a specific queue_position.

No candidate is rejected due to capacity; they simply wait for their turn in a transparent line.

2. Inactivity Decay & Penalized Repositioning (Requirement #7)
   To prevent the pipeline from "stalling" due to unresponsive candidates:

The 24-Hour Window: Once a candidate is promoted to ACTIVE, a 24-hour countdown begins.

The Decay: If the candidate fails to click "Confirm My Spot" within this window, they are penalized.

The Penalty: They are not deleted; instead, they are moved from ACTIVE back to WAITLISTED and placed at the very end of the current queue (MAX(position) + 1).

The Cascade: The system immediately identifies the next candidate in the waitlist and promotes them to the now-vacant ACTIVE spot.

3. Atomic Concurrency: The "Last Spot" Handshake (Requirement #5)
   To handle high-traffic spikes where two users might apply at the exact same millisecond for the final active spot:

PostgreSQL Transactions: We utilize BEGIN and COMMIT blocks.

The Approach: When an application is processed, the server locks the check on the current active count. If two requests hit simultaneously, the database handles them sequentially. The first one takes the ACTIVE spot, and the second is mathematically assigned queue_position 1 within the same transaction, preventing "Over-filling."

4. Traceability & State Transitions (Requirement #6)
   Every movement in the pipeline is reconstructable:

Active Logs: Every status change (Promotion, Decay, Rejection) is handled via atomic SQL updates.

Rejection Tracking: Rejected users are moved to a dedicated rejected_applicants table, preserving their original ID, name, and email for a permanent audit trail.

🛠 Tech Stack (PERN)
Frontend: React.js — Utilizing a polling mechanism to ensure the UI reflects the most recent database state without requiring page refreshes.

Backend: Node.js & Express — Designed with a "Cascade Trigger" architecture.

Database: PostgreSQL — Utilizing relational integrity and aggregate functions to manage queue indexing.

Icons & UI: Lucide-React — Provides visual cues for timers and status indicators.

API Client: Axios — Handles the communication between the portal and the automated backend.

⚙️ Implementation Details
The "Cascade Trigger" Mechanism
Instead of relying on a fragile third-party cron job, XcelCrowd uses a Dual-Trigger Cascade:

Background Worker: A setInterval function runs on the server every 60 seconds to clean up expired spots.

Just-In-Time (JIT) Check: Whenever any user checks their status or a recruiter views the dashboard, the server runs the runCascade() function first. This ensures the data is accurate to the second.

Gapless Re-indexing
When a candidate is removed or promoted, the system prevents "ghost positions":

SQL
UPDATE applicants SET queue_position = queue_position - 1 WHERE queue_position > 0;
This ensures that if Queue #1 is promoted, Queue #2 automatically becomes the new Queue #1.

🚦 Local Setup & Installation

1. Clone the Repository
   Bash
   git clone https://github.com/Vishn-vardhan-raju/xcel-crowd-ats.git
   cd xcel-crowd-ats
2. Database Setup
   Create a PostgreSQL database and run the following schema:

SQL
CREATE TABLE applicants (
id SERIAL PRIMARY KEY,
name VARCHAR(255) NOT NULL,
email VARCHAR(255) UNIQUE NOT NULL,
status VARCHAR(50) DEFAULT 'WAITLISTED',
queue_position INTEGER,
promoted_at TIMESTAMP,
acknowledged BOOLEAN DEFAULT false
);

CREATE TABLE rejected_applicants (
id INTEGER PRIMARY KEY,
name VARCHAR(255),
email VARCHAR(255),
rejected_at TIMESTAMP DEFAULT NOW()
); 3. Environment Configuration
Create a .env file in the backend folder:

Code snippet
DATABASE_URL=postgres://your_user:your_password@localhost:5432/your_db_name
PORT=5000 4. Run the Application
Bash

# In backend folder

npm install
node server.js

# In frontend folder

npm install
npm run dev
📡 API Documentation
Applicants API
POST /api/apply: Validates email (must start with a letter, end in .com) and places user in the pipeline.

GET /api/status/:email: Triggers the cascade and returns the user's current status and countdown timer.

POST /api/applicants/:id/acknowledge: Confirms a candidate's spot and stops the 24-hour decay timer.

Recruiter API
GET /api/applicants: Returns a combined object containing the live queue and the rejected history.

DELETE /api/applicants/:id/reject: Removes an applicant from the live queue, moves them to history, and triggers an immediate promotion cascade.

🕵️ Audit Trail
XcelCrowd is built for transparency. Every transition from WAITLISTED to ACTIVE is timestamped in the promoted_at column, and every manual rejection is logged in the rejected_applicants table, ensuring that the hiring process is fully traceable and reconstructable for compliance audits.

Framework: PERN Stack (PostgreSQL, Express, React, Node)
