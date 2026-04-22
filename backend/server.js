const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// HELPER: Re-indexes the queue for a specific job to ensure positions are 1, 2, 3...
const reindexQueue = async (client, jobId) => {
    const applicants = await client.query(
        'SELECT id FROM applicants WHERE job_id = $1 AND status = $2 ORDER BY queue_position ASC, created_at ASC',
        [jobId, 'WAITLISTED']
    );
    
    for (let i = 0; i < applicants.rows.length; i++) {
        await client.query(
            'UPDATE applicants SET queue_position = $1 WHERE id = $2',
            [i + 1, applicants.rows[i].id]
        );
    }
};

// --- CANDIDATE: Apply ---
app.post('/api/apply', async (req, res) => {
    const { jobId, name, email } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const jobRes = await client.query('SELECT active_capacity FROM jobs WHERE id = $1 FOR UPDATE', [jobId]);
        const activeCount = parseInt((await client.query('SELECT COUNT(*) FROM applicants WHERE job_id = $1 AND status = $2', [jobId, 'ACTIVE'])).rows[0].count);

        let status = (activeCount < jobRes.rows[0].active_capacity) ? 'ACTIVE' : 'WAITLISTED';
        let queue_pos = null;
        
        if (status === 'WAITLISTED') {
            const posRes = await client.query('SELECT COALESCE(MAX(queue_position), 0) + 1 as next FROM applicants WHERE job_id = $1', [jobId]);
            queue_pos = posRes.rows[0].next;
        }

        await client.query(
            `INSERT INTO applicants (job_id, name, email, status, queue_position, promoted_at, acknowledged) 
             VALUES ($1, $2, $3, $4, $5, ${status === 'ACTIVE' ? 'NOW()' : 'NULL'}, FALSE)`,
            [jobId, name, email, status, queue_pos]
        );

        await client.query('COMMIT');
        res.status(201).json({ success: true });
    } catch (e) { await client.query('ROLLBACK'); res.status(500).json({ error: e.message }); }
    finally { client.release(); }
});

// --- RECRUITER: Reject & Auto-Clean ---
app.patch('/api/applicants/:id/status', async (req, res) => {
    const { status } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const user = (await client.query('SELECT * FROM applicants WHERE id = $1', [req.params.id])).rows[0];

        // 1. Update the rejected user
        await client.query('UPDATE applicants SET status = $1, queue_position = NULL WHERE id = $2', [status, req.params.id]);

        // 2. If an ACTIVE spot opened up, promote the person at Position #1
        if (user.status === 'ACTIVE') {
            const next = (await client.query('SELECT * FROM applicants WHERE job_id = $1 AND status = $2 ORDER BY queue_position ASC LIMIT 1', [user.job_id, 'WAITLISTED'])).rows[0];
            if (next) {
                await client.query('UPDATE applicants SET status = $1, queue_position = NULL, promoted_at = NOW(), acknowledged = FALSE WHERE id = $2', ['ACTIVE', next.id]);
            }
        }

        // 3. ALWAYS Re-index the remaining waitlist to fix numbering gaps (like the 39, 40 seen in screenshot)
        await reindexQueue(client, user.job_id);

        await client.query('COMMIT');
        res.json({ success: true });
    } catch (e) { await client.query('ROLLBACK'); res.status(500).json({ error: e.message }); }
    finally { client.release(); }
});

// --- RECRUITER: Fetch List ---
app.get('/api/recruiter/applicants/:jobId', async (req, res) => {
    const result = await pool.query(
        'SELECT * FROM applicants WHERE job_id = $1 ORDER BY CASE WHEN status = $2 THEN 1 WHEN status = $3 THEN 2 ELSE 3 END, queue_position ASC',
        [req.params.jobId, 'ACTIVE', 'WAITLISTED']
    );
    res.json(result.rows);
});

// --- CANDIDATE: Status & Acknowledge ---
app.get('/api/status/:email', async (req, res) => {
    const result = await pool.query('SELECT * FROM applicants WHERE email = $1 ORDER BY created_at DESC LIMIT 1', [req.params.email]);
    res.json(result.rows[0] || { error: "Not found" });
});

app.post('/api/applicants/:id/acknowledge', async (req, res) => {
    await pool.query('UPDATE applicants SET acknowledged = TRUE WHERE id = $1', [req.params.id]);
    res.json({ success: true });
});

app.listen(5000, () => console.log("XcelCrowd Engine v2.4 - Clean Queue enabled"));