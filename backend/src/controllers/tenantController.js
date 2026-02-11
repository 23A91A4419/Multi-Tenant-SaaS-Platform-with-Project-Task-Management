const pool = require('../config/db');

/**
 * API 5: Get Tenant Details
 */
const getTenantDetails = async (req, res) => {
  const { tenantId } = req.params;
  const { tenantId: userTenantId, role } = req.user;

  // Authorization check
  if (role !== 'super_admin' && userTenantId !== tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized access',
    });
  }

  try {
    // Get tenant details
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

    // Safe stats (works even if tables don't exist)
    let totalUsers = 0;
    let totalProjects = 0;
    let totalTasks = 0;

    try {
      const usersCount = await pool.query(
        `SELECT COUNT(*) FROM users WHERE tenant_id = $1`,
        [tenantId]
      );
      totalUsers = Number(usersCount.rows[0].count);
    } catch (e) {}

    try {
      const projectsCount = await pool.query(
        `SELECT COUNT(*) FROM projects WHERE tenant_id = $1`,
        [tenantId]
      );
      totalProjects = Number(projectsCount.rows[0].count);
    } catch (e) {}

    try {
      const tasksCount = await pool.query(
        `SELECT COUNT(*) FROM tasks WHERE tenant_id = $1`,
        [tenantId]
      );
      totalTasks = Number(tasksCount.rows[0].count);
    } catch (e) {}

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
          totalUsers,
          totalProjects,
          totalTasks,
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

  const {
    name,
    status,
    subscriptionPlan,
    maxUsers,
    maxProjects
  } = req.body;

  // Authorization: must belong to tenant OR be super_admin
  if (role !== 'super_admin' && userTenantId !== tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized access',
    });
  }

  // tenant_admin restrictions
  if (role === 'tenant_admin') {
    if (
      status !== undefined ||
      subscriptionPlan !== undefined ||
      maxUsers !== undefined ||
      maxProjects !== undefined
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to update these fields',
      });
    }
  }

  // Build dynamic update query
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

  if (fields.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields provided for update',
    });
  }

  try {
    const updateResult = await pool.query(
      `UPDATE tenants
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${index}
       RETURNING id, name, updated_at`,
      [...values, tenantId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Tenant updated successfully',
      data: {
        id: updateResult.rows[0].id,
        name: updateResult.rows[0].name,
        updatedAt: updateResult.rows[0].updated_at,
      },
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
  const { role } = req.user;

  // Authorization check
  if (role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Not super_admin',
    });
  }

  // Query params
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const offset = (page - 1) * limit;

  const { status, subscriptionPlan } = req.query;

  // Filters
  const conditions = [];
  const values = [];
  let index = 1;

  if (status) {
    conditions.push(`t.status = $${index++}`);
    values.push(status);
  }

  if (subscriptionPlan) {
    conditions.push(`t.subscription_plan = $${index++}`);
    values.push(subscriptionPlan);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  try {
    // Total tenants count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM tenants t ${whereClause}`,
      values
    );

    const totalTenants = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(totalTenants / limit);

    // Get tenants list
    const tenantsResult = await pool.query(
      `
      SELECT
        t.id,
        t.name,
        t.subdomain,
        t.status,
        t.subscription_plan,
        t.created_at,
        COUNT(DISTINCT u.id) AS total_users,
        COUNT(DISTINCT p.id) AS total_projects
      FROM tenants t
      LEFT JOIN users u ON u.tenant_id = t.id
      LEFT JOIN projects p ON p.tenant_id = t.id
      ${whereClause}
      GROUP BY t.id
      ORDER BY t.created_at DESC
      LIMIT $${index} OFFSET $${index + 1}
      `,
      [...values, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: {
        tenants: tenantsResult.rows.map(t => ({
          id: t.id,
          name: t.name,
          subdomain: t.subdomain,
          status: t.status,
          subscriptionPlan: t.subscription_plan,
          totalUsers: Number(t.total_users),
          totalProjects: Number(t.total_projects),
          createdAt: t.created_at,
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalTenants,
          limit,
        },
      },
    });
  } catch (error) {
    console.error('LIST TENANTS ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to list tenants',
    });
  }
};

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/**
 * API 8: Add User to Tenant
 */
const addUserToTenant = async (req, res) => {
  const { tenantId } = req.params;
  const { tenantId: userTenantId, role } = req.user;

  const { email, password, fullName, role: newUserRole } = req.body;

  // Authorization: tenant_admin only
  if (role !== 'tenant_admin' || userTenantId !== tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to add users',
    });
  }

  if (!email || !password || !fullName) {
    return res.status(400).json({
      success: false,
      message: 'email, password and fullName are required',
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters',
    });
  }

  try {
    // Check tenant limits
    const tenantResult = await pool.query(
      `SELECT max_users FROM tenants WHERE id = $1`,
      [tenantId]
    );

    const maxUsers = tenantResult.rows[0].max_users;

    const usersCount = await pool.query(
      `SELECT COUNT(*) FROM users WHERE tenant_id = $1`,
      [tenantId]
    );

    if (Number(usersCount.rows[0].count) >= maxUsers) {
      return res.status(403).json({
        success: false,
        message: 'Subscription limit reached',
      });
    }

    // Check email uniqueness in tenant
    const existingUser = await pool.query(
      `SELECT id FROM users WHERE email = $1 AND tenant_id = $2`,
      [email, tenantId]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists in this tenant',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const finalRole = newUserRole === 'tenant_admin' ? 'tenant_admin' : 'user';

    const insertResult = await pool.query(
      `INSERT INTO users
       (id, tenant_id, email, password_hash, full_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, email, full_name, role, tenant_id, is_active, created_at`,
      [userId, tenantId, email, hashedPassword, fullName, finalRole]
    );

    const user = insertResult.rows[0];

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        tenantId: user.tenant_id,
        isActive: user.is_active,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('ADD USER ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create user',
    });
  }
};

/**
 * API 9: List Tenant Users
 */
const listTenantUsers = async (req, res) => {
  const { tenantId } = req.params;
  const { tenantId: userTenantId } = req.user;

  // Authorization: must belong to same tenant
  if (tenantId !== userTenantId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized access',
    });
  }

  // Query params
  const search = req.query.search;
  const role = req.query.role;

  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const offset = (page - 1) * limit;

  // Filters
  const conditions = [`tenant_id = $1`];
  const values = [tenantId];
  let index = 2;

  if (search) {
    conditions.push(`(email ILIKE $${index} OR full_name ILIKE $${index})`);
    values.push(`%${search}%`);
    index++;
  }

  if (role) {
    conditions.push(`role = $${index}`);
    values.push(role);
    index++;
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  try {
    // Total users count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      values
    );

    const totalUsers = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(totalUsers / limit);

    // Get users
    const usersResult = await pool.query(
      `
      SELECT
        id,
        email,
        full_name,
        role,
        is_active,
        created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${index} OFFSET $${index + 1}
      `,
      [...values, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: {
        users: usersResult.rows.map(u => ({
          id: u.id,
          email: u.email,
          fullName: u.full_name,
          role: u.role,
          isActive: u.is_active,
          createdAt: u.created_at,
        })),
        total: totalUsers,
        pagination: {
          currentPage: page,
          totalPages,
          limit,
        },
      },
    });
  } catch (error) {
    console.error('LIST TENANT USERS ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to list users',
    });
  }
};

module.exports = {
  getTenantDetails,
  updateTenant,
  listAllTenants,
  addUserToTenant,
  listTenantUsers
};