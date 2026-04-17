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