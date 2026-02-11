
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'saas_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

async function checkHash() {
    try {
        const userRes = await pool.query("SELECT email, password_hash FROM users WHERE email = 'admin@demo.com'");
        if (userRes.rows.length > 0) {
            console.log('HASH:', userRes.rows[0].password_hash);
        } else {
            console.log('User not found');
        }
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkHash();
