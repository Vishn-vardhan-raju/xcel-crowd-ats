const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Postgres Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --- ROUTES ---

// 1. Health Route: Check if DB and Server are alive
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'Backend is Live', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: 'DB Connection Failed' });
  }
});

// 2. Application Route: Handles new applicants & Autonomous Queue logic
app.post('/api/apply', async (req, res) => {
  const { jobId, name, email } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Start Transaction

    // Get Job Capacity and LOCK the row to prevent race conditions
    const jobRes = await client.query(
      'SELECT active_capacity FROM jobs WHERE id = $1 FOR UPDATE',
      [jobId]
    );
    
    if (jobRes.rows.length === 0) {
      throw new Error("Job not found");
    }
    
    const capacity = jobRes.rows[0].active_capacity;

    // Count current ACTIVE applicants
    const countRes = await client.query(
      "SELECT COUNT(*) FROM applicants WHERE job_id = $1 AND status = 'ACTIVE'",
      [jobId]
    );
    const activeCount = parseInt(countRes.rows[0].count);

    let status = 'WAITLISTED';
    let queuePosition = null;

    // Determine Status: If space exists, make ACTIVE. Otherwise, find Queue Pos.
    if (activeCount < capacity) {
      status = 'ACTIVE';
    } else {
      const posRes = await client.query(
        "SELECT COALESCE(MAX(queue_position), 0) + 1 as next_pos FROM applicants WHERE job_id = $1",
        [jobId]
      );
      queuePosition = posRes.rows[0].next_pos;
    }

    // Insert the Applicant
    const newApplicant = await client.query(
      `INSERT INTO applicants (job_id, name, email, status, queue_position) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [jobId, name, email, status, queuePosition]
    );

    await client.query('COMMIT'); // Save changes
    res.status(201).json(newApplicant.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK'); // Undo everything if there's an error
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 3. Recruiter Route: Get all applicants for a specific job (ordered by priority)
app.get('/api/jobs/:jobId/applicants', async (req, res) => {
  const { jobId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM applicants WHERE job_id = $1 ORDER BY status ASC, queue_position ASC',
      [jobId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 4. Admin Route: Update status & trigger the "Auto-Promotion" Chain Reaction
app.patch('/api/applicants/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // e.g., 'REJECTED' or 'HIRED'
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get current details of the applicant being updated
    const applicantRes = await client.query(
      'SELECT job_id, status FROM applicants WHERE id = $1',
      [id]
    );
    
    if (applicantRes.rows.length === 0) {
      return res.status(404).json({ error: "Applicant not found" });
    }

    const applicant = applicantRes.rows[0];

    // Update the status of the selected applicant and clear their queue position
    await client.query(
      'UPDATE applicants SET status = $1, queue_position = NULL WHERE id = $2',
      [status, id]
    );

    // If an ACTIVE spot was vacated, promote the next person in line
    if (applicant.status === 'ACTIVE') {
      const nextInLine = await client.query(
        `SELECT id FROM applicants 
         WHERE job_id = $1 AND status = 'WAITLISTED' 
         ORDER BY queue_position ASC LIMIT 1`,
        [applicant.job_id]
      );

      if (nextInLine.rows.length > 0) {
        const nextId = nextInLine.rows[0].id;
        
        // Promote #1 on waitlist to ACTIVE
        await client.query(
          `UPDATE applicants SET status = 'ACTIVE', queue_position = NULL WHERE id = $1`,
          [nextId]
        );

        // Shift everyone else remaining in the queue up by 1 (Pos 2 becomes 1, etc.)
        await client.query(
          `UPDATE applicants SET queue_position = queue_position - 1 
           WHERE job_id = $1 AND status = 'WAITLISTED'`,
          [applicant.job_id]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ message: "Status updated and queue managed successfully" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send("Server Error");
  } finally {
    client.release();
  }
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});