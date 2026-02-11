
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'saas_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

async function checkRel() {
    try {
        const tenantRes = await pool.query("SELECT id, name, subdomain FROM tenants WHERE subdomain = 'demo'");
        const tenant = tenantRes.rows[0];
        console.log('Tenant:', tenant);

        if (tenant) {
            const userRes = await pool.query("SELECT id, email, tenant_id, role FROM users WHERE email = 'admin@demo.com'");
            const user = userRes.rows[0];
            console.log('User:', user);

            if (user) {
                console.log(`Match? ${user.tenant_id === tenant.id}`);
            } else {
                console.log('User not found');
            }
        } else {
            console.log('Tenant not found');
        }

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkRel();
