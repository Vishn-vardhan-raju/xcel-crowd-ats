const express = require('express');
const cors = require('cors');
const db = require('./db'); 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Welcome Route
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
            <h1>🚀 XcelCrowd Backend is LIVE!</h1>
            <p>The PERN stack "Brain" is successfully listening.</p>
            <p>Check applicants at: <a href="/api/applicants">/api/applicants</a></p>
        </div>
    `);
});

// GET: Fetch all applicants
app.get('/api/applicants', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM applicants ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error("Fetch Error:", err.message);
        res.status(500).json({ error: "Could not fetch applicants." });
    }
});

// POST: Save a new applicant
app.post('/api/apply', async (req, res) => {
    const { name, email, resume_url } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: "Name and Email are required." });
    }

    try {
        const insertQuery = `
            INSERT INTO applicants (name, email, resume_url, status)
            VALUES ($1, $2, $3, 'applied')
            RETURNING *;
        `;
        const values = [name, email, resume_url];
        const result = await db.query(insertQuery, values);
        
        console.log("✅ Data saved to Postgres:", result.rows[0]);
        res.status(201).json({ message: "Application submitted successfully!" });
    } catch (err) {
        console.error("Database Insert Error:", err.message);
        res.status(500).json({ error: "Failed to save data." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});