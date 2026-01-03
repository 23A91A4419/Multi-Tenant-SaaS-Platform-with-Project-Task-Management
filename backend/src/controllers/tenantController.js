const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/**
 * API 5: Get Tenant Details
 */
const getTenantDetails = async (req, res) => {
  const { tenantId } = req.params;
  const { tenantId: userTenantId, role } = req.user;

  // ✅ super_admin OR same tenant
  if (role !== 'super_admin' && userTenantId !== tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized access',
    });
  }

  try {
    const tenantResult = await pool.query(
      `SELECT id, name, subdomain, status,
              subscription_plan, max_users, max_projects, created_at
       FROM tenants
       WHERE id = $1`,
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }

    const tenant = tenantResult.rows[0];

    const usersCount = await pool.query(
      `SELECT COUNT(*) FROM users WHERE tenant_id = $1`,
      [tenantId]
    );

    const projectsCount = await pool.query(
      `SELECT COUNT(*) FROM projects WHERE tenant_id = $1`,
      [tenantId]
    );

    const tasksCount = await pool.query(
      `SELECT COUNT(*) FROM tasks WHERE tenant_id = $1`,
      [tenantId]
    );

    return res.status(200).json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        status: tenant.status,
        subscriptionPlan: tenant.subscription_plan,
        maxUsers: tenant.max_users,
        maxProjects: tenant.max_projects,
        createdAt: tenant.created_at,
        stats: {
          totalUsers: Number(usersCount.rows[0].count),
          totalProjects: Number(projectsCount.rows[0].count),
          totalTasks: Number(tasksCount.rows[0].count),
        },
      },
    });
  } catch (error) {
    console.error('GET TENANT DETAILS ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tenant details',
    });
  }
};

/**
 * API 6: Update Tenant
 */
const updateTenant = async (req, res) => {
  const { tenantId } = req.params;
  const { tenantId: userTenantId, role } = req.user;

  if (role !== 'super_admin' && userTenantId !== tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized access',
    });
  }

  const { name, status, subscriptionPlan, maxUsers, maxProjects } = req.body;

  if (role === 'tenant_admin' && (status || subscriptionPlan || maxUsers || maxProjects)) {
    return res.status(403).json({
      success: false,
      message: 'You are not allowed to update these fields',
    });
  }

  const fields = [];
  const values = [];
  let index = 1;

  if (name !== undefined) {
    fields.push(`name = $${index++}`);
    values.push(name);
  }

  if (role === 'super_admin') {
    if (status !== undefined) {
      fields.push(`status = $${index++}`);
      values.push(status);
    }
    if (subscriptionPlan !== undefined) {
      fields.push(`subscription_plan = $${index++}`);
      values.push(subscriptionPlan);
    }
    if (maxUsers !== undefined) {
      fields.push(`max_users = $${index++}`);
      values.push(maxUsers);
    }
    if (maxProjects !== undefined) {
      fields.push(`max_projects = $${index++}`);
      values.push(maxProjects);
    }
  }

  if (!fields.length) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields provided',
    });
  }

  try {
    const result = await pool.query(
      `UPDATE tenants
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${index}
       RETURNING id, name, updated_at`,
      [...values, tenantId]
    );

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('UPDATE TENANT ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update tenant',
    });
  }
};

/**
 * API 7: List All Tenants (super_admin only)
 */
const listAllTenants = async (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Not super_admin',
    });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, subdomain, status, subscription_plan, created_at
       FROM tenants
       ORDER BY created_at DESC`
    );

    return res.status(200).json({
      success: true,
      data: { tenants: result.rows },
    });
  } catch (error) {
    console.error('LIST TENANTS ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list tenants',
    });
  }
};

/**
 * API 8: Add User to Tenant
 */
const addUserToTenant = async (req, res) => {
  const { tenantId } = req.params;
  const { tenantId: userTenantId, role } = req.user;

  if (role !== 'tenant_admin' || userTenantId !== tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized',
    });
  }

  const { email, password, fullName, role: newUserRole } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuidv4();

  const finalRole = newUserRole === 'tenant_admin' ? 'tenant_admin' : 'user';

  const result = await pool.query(
    `INSERT INTO users
     (id, tenant_id, email, password_hash, full_name, role, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,true)
     RETURNING id, email, full_name, role`,
    [userId, tenantId, email, hashedPassword, fullName, finalRole]
  );

  return res.status(201).json({
    success: true,
    data: result.rows[0],
  });
};

/**
 * API 9: List Tenant Users
 */
const listTenantUsers = async (req, res) => {
  const { tenantId } = req.params;
  const { tenantId: userTenantId, role } = req.user;

  // ✅ FIX: super_admin allowed
  if (role !== 'super_admin' && tenantId !== userTenantId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized access',
    });
  }

  const usersResult = await pool.query(
    `SELECT id, email, full_name, role, is_active, created_at
     FROM users
     WHERE tenant_id = $1
     ORDER BY created_at DESC`,
    [tenantId]
  );

  return res.status(200).json({
    success: true,
    data: { users: usersResult.rows },
  });
};

module.exports = {
  getTenantDetails,
  updateTenant,
  listAllTenants,
  addUserToTenant,
  listTenantUsers
};
