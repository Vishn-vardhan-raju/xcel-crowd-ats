const express = require('express');
const db = require('./db'); 
const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middleware: Allows the server to understand JSON data
app.use(express.json());

// 2. Welcome Route: Visit http://localhost:5000 to see this
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
            <h1>🚀 XcelCrowd Backend is LIVE!</h1>
            <p>The PERN stack "Brain" is successfully listening.</p>
            <p>Check applicants at: <a href="/api/applicants">/api/applicants</a></p>
        </div>
    `);
});

// 3. GET ROUTE: Fetch all applicants from the database
// This is where you will see your test data in the browser
app.get('/api/applicants', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM applicants ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error("Fetch Error:", err.message);
        res.status(500).json({ error: "Could not fetch applicants from database." });
    }
});

// 4. POST ROUTE: Save a new applicant
app.post('/api/apply', async (req, res) => {
    const { name, email, resume_url } = req.body;

    // 🛡️ Basic Validation
    if (!name || !email) {
        return res.status(400).json({ error: "Name and Email are required fields." });
    }

    try {
        const query = `
            INSERT INTO applicants (name, email, resume_url, status)
            VALUES ($1, $2, $3, 'applied')
            RETURNING *;
        `;
        const values = [name, email, resume_url];
        
// Change this line in server.js
const result = await db.query('SELECT * FROM applicants ORDER BY id DESC');        
        console.log("✅ Data saved to Postgres:", result.rows[0]);
        
        res.status(201).json({
            message: "Application submitted successfully!",
            applicant: result.rows[0]
        });
    } catch (err) {
        console.error("Database Insert Error:", err.message);
        res.status(500).json({ error: "Failed to save data to the database." });
    }
});

// 5. Start the Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});