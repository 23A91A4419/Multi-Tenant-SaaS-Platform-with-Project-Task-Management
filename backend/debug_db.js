const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'saas_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

async function debug() {
    try {
        console.log('Connecting to DB...', {
            host: pool.options.host,
            port: pool.options.port,
            database: pool.options.database,
            user: pool.options.user
        });

        console.log('--- TENANTS ---');
        const tenants = await pool.query('SELECT * FROM tenants');
        console.log(JSON.stringify(tenants.rows, null, 2));

        console.log('\n--- USERS ---');
        const users = await pool.query('SELECT id, email, tenant_id, role, full_name, is_active, password_hash FROM users');
        console.log(JSON.stringify(users.rows, null, 2));

    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        pool.end();
    }
}

debug();
