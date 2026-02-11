const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function waitDb() {
  let retries = 20;
  while (retries > 0) {
    try {
      await pool.query('SELECT 1');
      console.log('Database connected successfully');
      return true;
    } catch (err) {
      console.log(`Database not ready, retrying... (${retries} left)`);
      retries--;
      await new Promise(res => setTimeout(res, 2000));
    }
  }
  return false;
}

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (file.endsWith('.sql')) {
      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      try {
        await pool.query(sql);
        console.log(`Migration ${file} completed`);
      } catch (err) {
        if (err.code === '42P07') { // duplicate_table
          console.log(`Table already exists (skipping): ${file}`);
        } else {
          console.error(`Migration ${file} failed:`, err.message);
          throw err;
        }
      }
    }
  }
}

async function runSeeds() {
  const seedsDir = path.join(__dirname, 'seeds');
  const seedFile = path.join(seedsDir, 'seed_data.sql');
  
  if (fs.existsSync(seedFile)) {
    console.log('Running seeds...');
    const sql = fs.readFileSync(seedFile, 'utf8');
    try {
      await pool.query(sql);
      console.log('Seeds completed');
    } catch (err) {
      if (err.code === '23505') { // unique_violation
         console.log('Seed data conflict (skipping)');
      } else {
         console.error('Seeding failed:', err.message);
         // Don't throw, just log
      }
    }
  }
}

async function main() {
  if (await waitDb()) {
    try {
      await runMigrations();
      await runSeeds();
      console.log('Database initialization completed');
      process.exit(0);
    } catch (err) {
      console.error('Database initialization failed', err);
      process.exit(1);
    }
  } else {
    console.error('Could not connect to database');
    process.exit(1);
  }
}

main();
