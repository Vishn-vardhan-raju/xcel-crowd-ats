🚀 XcelCrowd: Autonomous Next-In-Line ATS
A Self-Governing Recruitment Engine Built for Atomic Fairness.

XcelCrowd is an advanced, automated recruitment pipeline designed to eliminate the manual overhead of queue management. Built with a "Self-Healing" philosophy, the system ensures that when a spot opens up, the next best candidate is promoted instantly, maintaining a fluid, transparent, and fair hiring experience without human intervention.

🏗️ System Architecture & Logic

1. The "Active Pool" & Capacity Management
   The system is governed by a strict Active Capacity of 3 applicants.

Automatic Status Assignment: The first three users to apply are granted ACTIVE status immediately.

Waitlist Overflow: Any applications received after the capacity is reached are placed in a Sequential Waitlist with a specific queue_position.

No Premature Rejection: Candidates are never rejected due to high volume; they are simply queued, ensuring every applicant has a fair chance once a spot vacates. 2. Inactivity Decay & Penalized Repositioning
To prevent the pipeline from "stalling" due to unresponsive candidates, XcelCrowd implements an Inactivity Decay mechanism.

The 24-Hour Window: Once a candidate is promoted to ACTIVE, they have a 24-hour window to acknowledge their spot.

The Penalty: If they fail to confirm, they are not deleted. Instead, they are moved back to the WAITLISTED status and placed at the very end of the current queue (MAX(position) + 1).

The Cascade: The system immediately identifies the next candidate in the waitlist and promotes them to the now-vacant ACTIVE spot, creating a continuous chain of movement. 3. Atomic Concurrency & The "Last Spot" Handshake
Designed for high-traffic scenarios, the backend prevents Race Conditions when multiple users apply simultaneously.

PostgreSQL Transactions: By utilizing BEGIN and COMMIT blocks, the system serializes incoming requests.

Approach: When a request hits the server, the database locks the check on the current active count. This ensures that even if two users apply at the exact same millisecond for one final spot, only one is promoted to ACTIVE while the other is accurately assigned queue_position 1 within the same transaction.
🛠️ Tech Stack (PERN)
Frontend: React.js — Optimized for real-time state synchronization via a polling mechanism.

Backend: Node.js & Express — Built with a Just-In-Time (JIT) Cascade Trigger architecture.

Database: PostgreSQL — Utilizing relational integrity, Row-Level Locking, and aggregate functions for queue management.

Icons: Lucide-React — Provides visual cues for timers and status indicators.
📡 API Documentation & EndpointsEndpointMethodInputOutputDescription/api/applyPOST{name, email}JSONValidates email and assigns to Active or Waitlist./api/status/:emailGETEmail ParamsJSONTriggers Cascade worker and returns current position/timer./api/applicantsGETNoneArrayReturns the live dashboard data and rejection history./api/applicants/:id/acknowledgePOSTID ParamsSuccessConfirms spot and halts the 24-hour decay timer./api/applicants/:id/rejectDELETEID ParamsSuccess
🕵️ Traceability Audit (Requirement #6)
Every state transition in XcelCrowd is recorded to ensure the pipeline is reconstructable.

Active Monitoring: The promoted_at timestamp tracks exactly when a user entered the active pool.

Historical Records: When a recruiter rejects an applicant, the system preserves their data in the rejected_applicants table before removing them from the live queue.

Gapless Re-indexing: If a candidate is removed, the system executes a recursive SQL update to ensure the waitlist remains sequential without "ghost positions".
Project Scope: Autonomous Next-In-Line Applicant Tracking System

Framework: PERN Stack Implementation
