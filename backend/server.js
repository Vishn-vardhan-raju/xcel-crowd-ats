const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const logTransition = async (client, applicantId, jobId, type, details) => {
    await client.query(
        'INSERT INTO pipeline_logs (applicant_id, job_id, action_type, details) VALUES ($1, $2, $3, $4)',
        [applicantId, jobId, type, details]
    );
};

// --- Requirement: Candidate Application ---
app.post('/api/apply', async (req, res) => {
    const { jobId, name, email } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const jobRes = await client.query('SELECT * FROM jobs WHERE id = $1 FOR UPDATE', [jobId]);
        const job = jobRes.rows[0];

        const activeCountRes = await client.query('SELECT COUNT(*) FROM applicants WHERE job_id = $1 AND status = $2', [jobId, 'ACTIVE']);
        const activeCount = parseInt(activeCountRes.rows[0].count);

        let status = (activeCount < job.active_capacity) ? 'ACTIVE' : 'WAITLISTED';
        let queue_pos = (status === 'WAITLISTED') ? 
            (await client.query('SELECT COALESCE(MAX(queue_position), 0) + 1 as next FROM applicants WHERE job_id = $1', [jobId])).rows[0].next : null;

        const newApp = await client.query(
            `INSERT INTO applicants (job_id, name, email, status, queue_position, promoted_at) 
             VALUES ($1, $2, $3, $4, $5, ${status === 'ACTIVE' ? 'NOW()' : 'NULL'}) RETURNING *`,
            [jobId, name, email, status, queue_pos]
        );

        await logTransition(client, newApp.rows[0].id, jobId, 'APPLIED', `Joined as ${status}`);
        await client.query('COMMIT');
        res.status(201).json(newApp.rows[0]);
    } catch (e) { await client.query('ROLLBACK'); res.status(500).json({ error: e.message }); }
    finally { client.release(); }
});

// --- Requirement: Candidate Status Check ---
app.get('/api/status/:email', async (req, res) => {
    const result = await pool.query('SELECT * FROM applicants WHERE email = $1 ORDER BY created_at DESC LIMIT 1', [req.params.email]);
    res.json(result.rows[0] || { error: "Not found" });
});

// --- Requirement: Recruiter Controls ---
app.get('/api/recruiter/applicants/:jobId', async (req, res) => {
    const result = await pool.query('SELECT * FROM applicants WHERE job_id = $1 ORDER BY status, queue_position', [req.params.jobId]);
    res.json(result.rows);
});

app.patch('/api/applicants/:id/status', async (req, res) => {
    const { status } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const user = (await client.query('SELECT * FROM applicants WHERE id = $1', [req.params.id])).rows[0];
        await client.query('UPDATE applicants SET status = $1, queue_position = NULL WHERE id = $2', [status, req.params.id]);
        
        if (status === 'REJECTED') {
            const next = (await client.query('SELECT * FROM applicants WHERE job_id = $1 AND status = $2 ORDER BY queue_position ASC LIMIT 1', [user.job_id, 'WAITLISTED'])).rows[0];
            if (next) {
                await client.query('UPDATE applicants SET status = $1, queue_position = NULL, promoted_at = NOW(), acknowledged = FALSE WHERE id = $2', ['ACTIVE', next.id]);
                await client.query('UPDATE applicants SET queue_position = queue_position - 1 WHERE job_id = $1 AND status = $2', [user.job_id, 'WAITLISTED']);
            }
        }
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (e) { await client.query('ROLLBACK'); res.status(500).json({ error: e.message }); }
    finally { client.release(); }
});

// --- Requirement: Inactivity Swap Logic (The Core) ---
const handleDecay = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const expired = await client.query(`SELECT * FROM applicants WHERE status = 'ACTIVE' AND acknowledged = FALSE AND promoted_at < NOW() - INTERVAL '1 minute'`); // Set to 1 min for testing

        for (let user of expired.rows) {
            const nextInQueue = (await client.query(`SELECT * FROM applicants WHERE job_id = $1 AND status = 'WAITLISTED' ORDER BY queue_position ASC LIMIT 1`, [user.job_id])).rows[0];
            
            if (nextInQueue) {
                // SWAP Logic
                await client.query(`UPDATE applicants SET status = 'WAITLISTED', queue_position = 1, promoted_at = NULL WHERE id = $1`, [user.id]);
                await client.query(`UPDATE applicants SET status = 'ACTIVE', queue_position = NULL, promoted_at = NOW(), acknowledged = FALSE WHERE id = $1`, [nextInQueue.id]);
                await client.query(`UPDATE applicants SET queue_position = queue_position + 1 WHERE job_id = $1 AND status = 'WAITLISTED' AND id != $2`, [user.job_id, user.id]);
                await logTransition(client, user.id, user.job_id, 'SWAPPED', `Swapped with ${nextInQueue.name} due to inactivity`);
            }
        }
        await client.query('COMMIT');
    } catch (e) { await client.query('ROLLBACK'); }
    finally { client.release(); }
};
setInterval(handleDecay, 30000);

app.listen(5000, () => console.log("XcelCrowd Engine v2 running on 5000"));