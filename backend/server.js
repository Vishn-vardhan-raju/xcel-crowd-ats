const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Postgres Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Minimal Health Route
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'Backend is Live', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: 'DB Connection Failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
app.post('/apply', async (req, res) => {
  const { jobId, name, email } = req.body;
  const client = await pool.connect(); // Use a single client for the transaction

  try {
    await client.query('BEGIN'); // Start Transaction

    // 1. Get Job Capacity (Locking the row for concurrency)
    const jobRes = await client.query(
      'SELECT active_capacity FROM jobs WHERE id = $1 FOR UPDATE',
      [jobId]
    );
    const capacity = jobRes.rows[0].active_capacity;

    // 2. Count current ACTIVE applicants
    const activeCountRes = await client.query(
      "SELECT COUNT(*) FROM applicants WHERE job_id = $1 AND status = 'ACTIVE'",
      [jobId]
    );
    const activeCount = parseInt(activeCountRes.rows[0].count);

    let status = 'WAITLISTED';
    let queuePos = null;

    if (activeCount < capacity) {
      status = 'ACTIVE';
    } else {
      // Find the next queue position
      const lastPosRes = await client.query(
        "SELECT MAX(queue_position) FROM applicants WHERE job_id = $1 AND status = 'WAITLISTED'",
        [jobId]
      );
      queuePos = (parseInt(lastPosRes.rows[0].max) || 0) + 1;
    }

    // 3. Insert Applicant
    const newApplicant = await client.query(
      'INSERT INTO applicants (job_id, name, email, status, queue_position) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [jobId, name, email, status, queuePos]
    );

    await client.query('COMMIT'); // Save everything
    res.json(newApplicant.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK'); // Cancel if something fails
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});