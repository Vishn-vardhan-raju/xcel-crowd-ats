# 🚀 XcelCrowd: Autonomous Next-In-Line ATS

<p align="center">
  <b>A Self-Governing Recruitment Engine Built for Atomic Fairness.</b>
</p>

<br />

<div align="center">
  <img src="https://github.com/Vishn-vardhan-raju/xcel-crowd-ats/blob/main/your-main-image.png?raw=true" width="900px" alt="Main Dashboard Header" />
</div>

---

## 🏗️ System Architecture & Logic

XcelCrowd eliminates manual queue management through a "Self-Healing" pipeline. When a spot opens, the system promotes the next candidate instantly.

### 1. The "Active Pool" & Capacity

The system maintains a strict **Active Capacity of 3**.

- **Automatic Status:** The first 3 applicants are `ACTIVE`.
- **Waitlist:** All others are assigned a `queue_position`.

<br />

<div align="center">
  <img src="https://github.com/Vishn-vardhan-raju/xcel-crowd-ats/blob/main/your-recruiter-ss.png?raw=true" width="850px" alt="Recruiter Dashboard" />
  <p><i>Figure 1: Recruiter Dashboard showing real-time queue management.</i></p>
</div>

<br />

### 2. Inactivity Decay (The 24-Hour Rule)

- **The Window:** Candidates have 24 hours to confirm their spot.
- **The Penalty:** Unresponsive users are moved to the end of the waitlist (`MAX(pos) + 1`).
- **The Cascade:** The system instantly promotes the next person to fill the vacancy.

---

## 🗄️ Database Schema

The following tables handle the live state and the permanent audit trail.

<table width="100%">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th>Table: applicants</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>id</b></td>
      <td>SERIAL</td>
      <td>Primary Key</td>
    </tr>
    <tr>
      <td><b>email</b></td>
      <td>VARCHAR</td>
      <td>Unique identifier for status checks</td>
    </tr>
    <tr>
      <td><b>status</b></td>
      <td>VARCHAR</td>
      <td>'ACTIVE' or 'WAITLISTED'</td>
    </tr>
    <tr>
      <td><b>queue_position</b></td>
      <td>INTEGER</td>
      <td>Current rank in the waitlist</td>
    </tr>
    <tr>
      <td><b>promoted_at</b></td>
      <td>TIMESTAMP</td>
      <td>Used for the 24-hour decay calculation</td>
    </tr>
  </tbody>
</table>

<br />

---

## 📡 API Endpoints

<table width="100%">
  <thead>
    <tr style="background-color: #e8f4fd;">
      <th>Method</th>
      <th>Endpoint</th>
      <th>Function</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>POST</code></td>
      <td>/api/apply</td>
      <td>Validates email and enters the user into the pipeline.</td>
    </tr>
    <tr>
      <td><code>GET</code></td>
      <td>/api/status/:email</td>
      <td>Triggers Cascade worker and returns current status/timer.</td>
    </tr>
    <tr>
      <td><code>POST</code></td>
      <td>/api/applicants/:id/acknowledge</td>
      <td>Confirms spot and halts the 24-hour decay timer.</td>
    </tr>
    <tr>
      <td><code>DELETE</code></td>
      <td>/api/applicants/:id/reject</td>
      <td>Moves user to history and promotes the next in line.</td>
    </tr>
  </tbody>
</table>

---

## 🛠️ Tech Stack

- **Frontend:** [React.js](https://reactjs.org/)
- **Backend:** [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Icons:** [Lucide-React](https://lucide.dev/)

---

## 🚦 Installation & Local Setup

### 1. Clone the Repository

```bash
git clone [https://github.com/Vishn-vardhan-raju/xcel-crowd-ats.git](https://github.com/Vishn-vardhan-raju/xcel-crowd-ats.git)
cd xcel-crowd-ats
```
