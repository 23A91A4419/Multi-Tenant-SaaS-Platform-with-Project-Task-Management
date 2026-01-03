const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

(async () => {
  try {
    await client.connect();

    const migrationDir = path.join(__dirname, "../migrations");
    const seedDir = path.join(__dirname, "../seeds");

    console.log("Running migrations from:", migrationDir);

    const migrationFiles = fs.readdirSync(migrationDir).sort();
    for (const file of migrationFiles) {
      const sql = fs.readFileSync(path.join(migrationDir, file), "utf8");
      await client.query(sql);
      console.log("Ran migration:", file);
    }

    const seedFile = path.join(seedDir, "seed_data.sql");   // <-- FIXED HERE
    if (fs.existsSync(seedFile)) {
      const seedSQL = fs.readFileSync(seedFile, "utf8");
      await client.query(seedSQL);
      console.log("Seed data loaded");
    } else {
      console.warn("Seed file not found:", seedFile);
    }

    console.log("DATABASE READY");
    process.exit();
  } catch (err) {
    console.error("DB INIT FAILED:", err);
    process.exit(1);
  }
})();
