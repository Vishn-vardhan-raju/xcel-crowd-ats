# 🚀 XcelCrowd: Autonomous Next-In-Line ATS

<p align="center">
  <b>A Self-Governing Recruitment Engine Built for Atomic Fairness and Automated Queue Management.</b>
</p>

<br />

<div align="center">
  <img src="https://raw.githubusercontent.com/Vishn-vardhan-raju/xcel-crowd-ats/main/candidate_portal_ss.png" width="850px" style="border-radius: 10px; border: 1px solid #ddd;" alt="Candidate Portal Interface" />
  <p><i>Candidate Interface: Real-time status tracking and acknowledgment portal.</i></p>
</div>

<hr />

## 📋 Core Project Requirements & Implementation

<table width="100%">
  <tr style="background-color: #f8f9fa;">
    <th width="30%">Requirement</th>
    <th>Technical Implementation Detail</th>
  </tr>
  <tr>
    <td><b>1. Defined Active Capacity</b></td>
    <td>System maintains a strict <b>Active Capacity of 3</b>. All logic is governed by this constant to ensure no manual overhead.</td>
  </tr>
  <tr>
    <td><b>2. Non-Rejection Waitlist</b></td>
    <td>Applications beyond 3 are automatically assigned <code>WAITLISTED</code> status. No candidate is rejected due to volume.</td>
  </tr>
  <tr>
    <td><b>3. Auto-Promotion Cascade</b></td>
    <td>When an <code>ACTIVE</code> spot opens (via rejection or decay), the system automatically promotes the candidate at <code>Queue Pos: 1</code>.</td>
  </tr>
  <tr>
    <td><b>4. Transparent Status</b></td>
    <td>Applicants can verify their status, queue position, and remaining acknowledgment time via a secure email-based check.</td>
  </tr>
  <tr>
    <td><b>5. Atomic Concurrency</b></td>
    <td>Handles the "Last Spot" race condition using <b>PostgreSQL Transactions</b> and pessimistic locking.</td>
  </tr>
  <tr>
    <td><b>6. Traceability</b></td>
    <td>All state transitions are logged via a <b>Rejected History Table</b> and timestamp-based tracking (<code>promoted_at</code>).</td>
  </tr>
  <tr>
    <td><b>7. Inactivity Decay</b></td>
    <td><b>24-Hour Window:</b> If a promoted user fails to acknowledge, they are moved to <code>MAX(pos) + 1</code> (Penalized Position).</td>
  </tr>
</table>

<br />

<div align="center">
  <img src="https://raw.githubusercontent.com/Vishn-vardhan-raju/xcel-crowd-ats/main/recruiter_dashboard_ss.png" width="850px" style="border-radius: 10px; border: 1px solid #ddd;" alt="Recruiter Dashboard Interface" />
  <p><i>Recruiter Dashboard: Managing the Live Queue and auditing Rejected History.</i></p>
</div>

<hr />

## 🧠 Technical Deep-Dive: The "Last Spot" Race Condition

<p>In high-traffic recruitment environments, a significant technical challenge arises when <b>two applications arrive at the exact same millisecond</b> for the last available <code>ACTIVE</code> spot. Without robust concurrency control, a standard "Check-then-Act" logic failure occurs.</p>

### **The Hazard: "Check-then-Act" Failure**

<p>Normally, a backend would execute two separate steps:</p>
<ol>
  <li><code>SELECT COUNT(*) FROM applicants WHERE status = 'ACTIVE';</code></li>
  <li><code>if (count < 3) { INSERT ... status = 'ACTIVE' }</code></li>
</ol>
<p>If two threads (Request A and Request B) execute Step 1 simultaneously, they both see a count of 2. Both threads then proceed to Step 2, and both insert an "Active" user. Result: <b>The system capacity is breached (4/3 active users)</b>, destroying the integrity of the queue and the fairness of the promotion logic.</p>

### **Our Solution: PostgreSQL Atomic Transactions & Pessimistic Locking**

<p>To solve this, XcelCrowd implements a strict <b>ACID-compliant</b> transaction model that ensures total serializability of incoming requests:</p>
<ul>
  <li><b>The BEGIN/COMMIT Block:</b> Every application submission is wrapped in a single database transaction. This ensures that the operation is all-or-nothing.</li>
  <li><b>Pessimistic Locking (FOR UPDATE):</b> We utilize <code>SELECT ... FOR UPDATE</code> on the target row/table. This forces PostgreSQL to grant a lock to Request A, effectively making Request B wait in a "sleep" state until Request A has finished its operation.</li>
  <li><b>Deterministic Outcome:</b> 
    <ul>
      <li><b>Request A:</b> Obtains the lock, confirms the count is 2, inserts the 3rd <code>ACTIVE</code> user, and commits.</li>
      <li><b>Request B:</b> The lock is released. Request B now executes its check, sees the count is 3, and is mathematically forced to <code>WAITLISTED (Pos 1)</code>.</li>
    </ul>
  </li>
  <li><b>Queue Fairness Guarantee:</b> This prevents "Double-Booking" and ensures that the order of application is the absolute order of the queue, down to the microsecond level.</li>
  <li><b>Scalability:</b> While locking introduces a few milliseconds of latency, it is a critical trade-off to maintain 100% data integrity and user trust in a competitive hiring pipeline.</li>
</ul>

<hr />

## 🗄️ Database Architecture

<table width="100%">
  <thead>
    <tr style="background-color: #eef2f7;">
      <th>Table Name</th>
      <th>Field</th>
      <th>Type</th>
      <th>Logic Role</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="4"><b>applicants</b></td>
      <td>email</td>
      <td>VARCHAR (Unique)</td>
      <td>Primary identifier for candidate status tracking.</td>
    </tr>
    <tr>
      <td>status</td>
      <td>VARCHAR</td>
      <td>Either 'ACTIVE' (max 3) or 'WAITLISTED'.</td>
    </tr>
    <tr>
      <td>queue_position</td>
      <td>INTEGER</td>
      <td>Sequential rank (1, 2, 3...) for waitlisted users.</td>
    </tr>
    <tr>
      <td>promoted_at</td>
      <td>TIMESTAMP</td>
      <td>Starts the 24-hour decay timer upon promotion.</td>
    </tr>
    <tr style="background-color: #fff5f5;">
      <td><b>rejected_applicants</b></td>
      <td>rejected_at</td>
      <td>TIMESTAMP</td>
      <td>Audit trail for users removed by the recruiter.</td>
    </tr>
  </tbody>
</table>

<hr />

## 🛠️ Execution & Installation Commands

<table width="100%" style="background-color: #2d3436; color: #dfe6e9; border-radius: 8px;">
  <tr>
    <td>
      <pre>
# 1. Clone the repository
git clone https://github.com/Vishn-vardhan-raju/xcel-crowd-ats.git

# 2. Setup Environment Variables (.env)

DATABASE_URL=postgres://user:pass@localhost:5432/ats_db
PORT=5000

# 3. Start Backend

cd backend
npm install
node server.js

# 4. Start Frontend

cd ../frontend
npm install
npm run dev
</pre>
</td>

  </tr>
</table>

<hr />

## 🚀 Installation Details

<ol>
  <li><b>Prerequisites:</b> Ensure Node.js and PostgreSQL are installed.</li>
  <li><b>Database Initializing:</b> Create a DB named <code>ats_db</code> and execute the schema provided in the documentation.</li>
  <li><b>Vite Server:</b> The frontend runs on <code>localhost:5173</code> by default.</li>
  <li><b>Automatic Cascade:</b> The 24-hour decay check triggers automatically on every status check or dashboard refresh.</li>
</ol>

<br />

<p align="right">
  <b>Developed by:</b> <a href="https://github.com/Vishn-vardhan-raju">T Vishnu Vardhan Raju</a><br />
  <b>Tech Stack:</b> PostgreSQL, Express, React, Node.js (PERN)
</p>
