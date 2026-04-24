const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Final Requirement: 24-Hour Decay Window
const DECAY_WINDOW_HOURS = 24;

// --- CORE CASCADE LOGIC ---
const runCascade = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Handle Expirations: Move expired ACTIVE users who didn't acknowledge to the end
        const expired = await client.query(`
            SELECT id FROM applicants 
            WHERE status = 'ACTIVE' AND acknowledged = false 
            AND promoted_at < NOW() - INTERVAL '${DECAY_WINDOW_HOURS} hours'
        `);

        for (let row of expired.rows) {
            const maxPosRes = await client.query("SELECT COALESCE(MAX(queue_position), 0) + 1 as pos FROM applicants");
            const newPos = maxPosRes.rows[0].pos;

            await client.query(`
                UPDATE applicants SET 
                status = 'WAITLISTED', queue_position = $1, promoted_at = NULL, acknowledged = false 
                WHERE id = $2`, [newPos, row.id]);
        }

        // 2. Auto-Promotion: Ensure Top 3 are always ACTIVE
        const activeCountRes = await client.query("SELECT COUNT(*) FROM applicants WHERE status = 'ACTIVE'");
        let activeCount = parseInt(activeCountRes.rows[0].count);

        while (activeCount < 3) {
            const nextInLine = await client.query(`
                SELECT id FROM applicants WHERE status = 'WAITLISTED' 
                ORDER BY queue_position ASC LIMIT 1`);

            if (nextInLine.rows.length === 0) break;

            const promoteId = nextInLine.rows[0].id;
            await client.query(`
                UPDATE applicants SET 
                status = 'ACTIVE', promoted_at = NOW(), queue_position = NULL, acknowledged = false 
                WHERE id = $1`, [promoteId]);
            
            // Shift remaining queue up
            await client.query("UPDATE applicants SET queue_position = queue_position - 1 WHERE queue_position > 0");
            activeCount++;
        }

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Cascade error:", e);
    } finally {
        client.release();
    }
};

// Periodic check every minute as a fallback
setInterval(runCascade, 60000);

// --- ROUTES ---

app.post('/api/apply', async (req, res) => {
    const { name, email } = req.body;
    // Validation: Starts with letter, ends with .com
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.com$/;
    if (!emailRegex.test(email)) return res.status(400).json({ error: "Invalid Email format" });

    try {
        await runCascade();
        const activeCheck = await pool.query("SELECT COUNT(*) FROM applicants WHERE status = 'ACTIVE'");
        const status = parseInt(activeCheck.rows[0].count) < 3 ? 'ACTIVE' : 'WAITLISTED';
        const promoted_at = status === 'ACTIVE' ? new Date() : null;
        
        let qPos = null;
        if (status === 'WAITLISTED') {
            const max = await pool.query("SELECT COALESCE(MAX(queue_position), 0) + 1 as pos FROM applicants");
            qPos = max.rows[0].pos;
        }

        await pool.query(
            "INSERT INTO applicants (name, email, status, queue_position, promoted_at) VALUES ($1, $2, $3, $4, $5)",
            [name, email, status, qPos, promoted_at]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/status/:email', async (req, res) => {
    await runCascade();
    const result = await pool.query("SELECT * FROM applicants WHERE email = $1", [req.params.email]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
});

app.get('/api/applicants', async (req, res) => {
    await runCascade();
    const applicants = await pool.query("SELECT * FROM applicants ORDER BY CASE WHEN status='ACTIVE' THEN 0 ELSE 1 END, queue_position ASC");
    const rejected = await pool.query("SELECT * FROM rejected_applicants ORDER BY rejected_at DESC");
    res.json({ active: applicants.rows, rejected: rejected.rows });
});

app.post('/api/applicants/:id/acknowledge', async (req, res) => {
    await pool.query("UPDATE applicants SET acknowledged = true WHERE id = $1", [req.params.id]);
    res.json({ success: true });
});

app.delete('/api/applicants/:id/reject', async (req, res) => {
    try {
        const user = await pool.query("SELECT * FROM applicants WHERE id = $1", [req.params.id]);
        if (user.rows.length > 0) {
            await pool.query("INSERT INTO rejected_applicants (id, name, email) VALUES ($1, $2, $3)", 
                [user.rows[0].id, user.rows[0].name, user.rows[0].email]);
            await pool.query("DELETE FROM applicants WHERE id = $1", [req.params.id]);
        }
        await runCascade();
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(5000, () => console.log("Final Server running on 5000"));