const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  try {
    await pool.query('DELETE FROM applicants');
    await pool.query('DELETE FROM jobs');
    await pool.query('INSERT INTO jobs (title, active_capacity) VALUES ($1, $2)', ['Software Engineer', 2]);
    console.log("✅ Database seeded with a job (Capacity: 2)");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
seed();