require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const seedDatabase = async () => {
  try {
    console.log("🌱 Seeding database...");
    
    // Clear existing data (Be careful! This is for development)
    await pool.query('TRUNCATE jobs, applicants RESTART IDENTITY CASCADE');

    // Insert initial jobs with different capacities
    const query = `
      INSERT INTO jobs (title, active_capacity) 
      VALUES 
      ('Frontend Engineer', 3),
      ('Backend Developer', 2),
      ('UI/UX Designer', 1)
      RETURNING *;
    `;
    
    const res = await pool.query(query);
    console.log("✅ Successfully inserted jobs:");
    console.table(res.rows);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  }
};

seedDatabase();