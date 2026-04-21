const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 1. HEALTH & STATS
app.get('/api/health', (req, res) => res.json({ status: "Online" }));

app.get('/api/jobs/:jobId/summary', async (req, res) => {
  try {
    const stats = await pool.query(
      `SELECT 
        (SELECT active_capacity FROM jobs WHERE id = $1) as capacity,
        (SELECT COUNT(*) FROM applicants WHERE job_id = $1 AND status = 'ACTIVE') as active,
        (SELECT COUNT(*) FROM applicants WHERE job_id = $1 AND status = 'WAITLISTED') as queued`,
      [req.params.jobId]
    );
    res.json(stats.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. APPLY ROUTE (With Validation & Queue Logic)
app.post('/api/apply', async (req, res) => {
  const { jobId, name, email } = req.body;
  if (!name || !email || !jobId) return res.status(400).json({ error: "Missing fields" });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const job = await client.query('SELECT active_capacity FROM jobs WHERE id = $1 FOR UPDATE', [jobId]);
    const activeCount = await client.query("SELECT COUNT(*) FROM applicants WHERE job_id = $1 AND status = 'ACTIVE'", [jobId]);
    
    let status = 'WAITLISTED', qPos = null;
    if (parseInt(activeCount.rows[0].count) < job.rows[0].active_capacity) {
      status = 'ACTIVE';
    } else {
      const lastPos = await client.query("SELECT COALESCE(MAX(queue_position), 0) + 1 as pos FROM applicants WHERE job_id = $1", [jobId]);
      qPos = lastPos.rows[0].pos;
    }

    const result = await client.query(
      'INSERT INTO applicants (job_id, name, email, status, queue_position) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [jobId, name, email, status, qPos]
    );
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

// 3. PROMOTION ROUTE (The Chain Reaction)
app.patch('/api/applicants/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const current = await client.query('SELECT job_id, status FROM applicants WHERE id = $1', [id]);
    const applicant = current.rows[0];

    await client.query('UPDATE applicants SET status = $1, queue_position = NULL WHERE id = $2', [status, id]);

    if (applicant.status === 'ACTIVE') {
      const next = await client.query(
        'SELECT id FROM applicants WHERE job_id = $1 AND status = ' + "'WAITLISTED' ORDER BY queue_position ASC LIMIT 1",
        [applicant.job_id]
      );
      if (next.rows.length > 0) {
        await client.query("UPDATE applicants SET status = 'ACTIVE', queue_position = NULL WHERE id = $1", [next.rows[0].id]);
        await client.query("UPDATE applicants SET queue_position = queue_position - 1 WHERE job_id = $1 AND status = 'WAITLISTED'", [applicant.job_id]);
      }
    }
    await client.query('COMMIT');
    res.json({ message: "Success: Queue updated" });
  } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Working Model Live on port ${PORT}`));
app.get('/api/jobs/:jobId/applicants', async (req, res) => {
  const { jobId } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, name, email, status, queue_position FROM applicants WHERE job_id = $1 ORDER BY status ASC, queue_position ASC',
      [jobId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});