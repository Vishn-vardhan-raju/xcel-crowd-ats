# 🚀 XcelCrowd: Autonomous Next-In-Line ATS

> **A Hiring Pipeline That Moves Itself.**

XcelCrowd is an automated recruitment engine designed to eliminate the manual overhead of queue management. Built with a **"Self-Healing"** philosophy, the system ensures that when a spot opens up, the next best candidate is promoted instantly, maintaining a fluid, transparent, and fair hiring experience.

---

## 🛠 Tech Stack (PERN)

- **Frontend:** `React.js` (Vite) — Optimized for real-time state synchronization.
- **Backend:** `Node.js` & `Express` — Designed with modular, atomic service layers.
- **Database:** `PostgreSQL` — Utilizing advanced **Row-Level Locking** for industrial-grade concurrency.
- **UI/UX:** `Lucide-React` & `Tailwind-styled CSS` — For high-fidelity visual auditing.
- **API Client:** `Axios` — With centralized error handling.

---

## 🏗 Key Features & Architectural Highlights

### 1️⃣ Role-Based Multi-Portal Interface

XcelCrowd provides distinct, decoupled entry points:

- **Candidate Portal (`/candidate`):** Direct transparency into queue positions and promotion acknowledgment.
- **Recruiter Dashboard (`/recruiter`):** A command center for auditing the pipeline and triggering the promotion cascade.

### 2️⃣ Gapless "Self-Healing" Queue (Re-indexing Algorithm)

Unlike static lists, XcelCrowd corrects its own numbering. If any candidate is rejected or removed, a **recursive re-indexing function** fires immediately to ensure the waitlist remains a perfect sequence (1, 2, 3...) without "ghost positions" or fragmentation.

### 3️⃣ Atomic Concurrency & The "Last Spot" Handshake

Designed for high-traffic spikes, the backend prevents **"Race Conditions."** When two users apply at the same millisecond for one final spot, the system uses **PostgreSQL Transactions** to referee the entry, ensuring only one becomes `ACTIVE` while the other is accurately queued.

---

## ⚙️ Core Logic & Requirements Fulfillment (Audit-Ready)

| Requirement             | Technical Implementation                                                             |
| :---------------------- | :----------------------------------------------------------------------------------- |
| **1. Defined Capacity** | Managed via `active_capacity` parameters in the `jobs` relational schema.            |
| **2. Waitlist logic**   | Automated status assignment prevents premature rejections.                           |
| **3. Auto-Promotion**   | Chain-reaction logic triggered by `ACTIVE` candidate exit or rejection.              |
| **4. Status Check**     | Real-time `GET` requests to retrieve position and `acknowledged` status.             |
| **5. Concurrency**      | Implemented via `BEGIN/COMMIT` and `SELECT ... FOR UPDATE` locking.                  |
| **6. Traceability**     | Every state transition is recorded in `pipeline_logs` for historical reconstruction. |
| **7. Inactivity Decay** | 24-hour decay window with **Penalized Repositioning** (`MAX(pos) + 1`).              |

---

## 🚦 Local Setup & Installation

To run XcelCrowd on your local machine, follow these steps exactly:

### **1. Clone the Repository**

```bash
git clone [https://github.com/Vishn-vardhan-raju/xcel-crowd-ats.git](https://github.com/Vishn-vardhan-raju/xcel-crowd-ats.git)
cd xcel-crowd-ats
```

# ⚙️ XcelCrowd: Technical Implementation & Audit Guide

This document provides a deep dive into how XcelCrowd fulfills the core requirements of the autonomous recruitment challenge, specifically focusing on concurrency, state transitions, and auditability.

---

## 🛡️ Requirement Fulfillment Matrix

| Requirement             | implementation Logic                                                | Code Location                    |
| :---------------------- | :------------------------------------------------------------------ | :------------------------------- |
| **1. Job Capacity**     | Defined via `active_capacity` in the `jobs` table.                  | `/backend/server.js`             |
| **2. Waitlist logic**   | Automated status assignment prevents premature rejections.          | `/backend/routes/apply.js`       |
| **3. Auto-Promotion**   | Chain-reaction logic triggered by `ACTIVE` candidate exit.          | `/backend/services/promotion.js` |
| **4. Status Check**     | Real-time `GET` requests for position and `acknowledged` status.    | `/frontend/src/pages/Status.jsx` |
| **5. Concurrency**      | Implemented via `BEGIN/COMMIT` and `SELECT ... FOR UPDATE` locking. | `/backend/db/index.js`           |
| **6. Traceability**     | Every state transition is recorded in `pipeline_logs`.              | `/backend/middleware/logger.js`  |
| **7. Inactivity Decay** | 24-hour decay window with **Penalized Repositioning**.              | `/backend/workers/decay.js`      |

---

## 🧠 Deep Dive: Advanced System Logic

### 1. Atomic Concurrency (Requirement #5)

To handle the "Last Available Spot" race condition:

- The system initiates a **PostgreSQL Transaction**.
- It locks the specific Job row using `FOR UPDATE`.
- No other process can read the capacity until the current transaction completes.
- **Result:** Total elimination of "Over-filling" errors.

### 2. Gapless Re-indexing (The Self-Healing Queue)

When a candidate is removed from the waitlist (Positions 1, 2, 3, 4, 5), the system does not leave a hole.

- A recursive SQL update triggers: `UPDATE applicants SET queue_position = queue_position - 1 WHERE queue_position > $1`.
- This ensures the line is always sequential, maintaining user trust and system clarity.

### 3. Inactivity Decay & Penalty (Requirement #7)

If an `ACTIVE` applicant fails to acknowledge their promotion within the 24-hour window:

- **Status Shift:** Reverts from `ACTIVE` to `WAITLISTED`.
- **Penalty:** Their `queue_position` is set to `(SELECT MAX(queue_position) FROM applicants) + 1`.
- **Cascade:** The next person in line is automatically promoted to fill the newly opened spot.

---

## 🕵️ Traceability Audit (Requirement #6)

The `pipeline_logs` table stores the following "Paper Trail":

- `applicant_id`: Who moved?
- `action_type`: Applied, Promoted, Acknowledged, Rejected, or Decayed.
- `details`: The previous and new status/position.
- `created_at`: Exact microsecond of the transition.

---

## 🧠 AI Collaboration Dimension (XVal Evaluation)

The development of these complex features involved iterative AI refinement:

- **Refinement:** AI audited the concurrency logic to ensure no deadlocks occurred during high-traffic simulations.
- **Customization:** The **Penalized Repositioning** strategy was customized to ensure that users are never "deleted," merely shifted back, balancing fairness with system efficiency.
