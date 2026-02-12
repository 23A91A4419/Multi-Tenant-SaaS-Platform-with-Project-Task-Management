const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const logAction = async (tenantId, userId, action, entityType, entityId, ipAddress = null) => {
    try {
        const id = uuidv4();
        await pool.query(
            `INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [id, tenantId, userId, action, entityType, entityId, ipAddress]
        );
    } catch (error) {
        console.error('AUDIT LOG ERROR:', error);
        // Don't crash the request if logging fails, but log the error
    }
};

module.exports = { logAction };
