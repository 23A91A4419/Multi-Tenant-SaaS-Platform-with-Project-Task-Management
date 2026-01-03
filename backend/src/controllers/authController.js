const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const { generateToken } = require('../utils/jwt');

/**
 * API 1: Register Tenant
 * (UNCHANGED)
 */
const registerTenant = async (req, res) => {
  const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;

  if (!tenantName || !subdomain || !adminEmail || !adminPassword || !adminFullName) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const subdomainCheck = await client.query(
      'SELECT id FROM tenants WHERE subdomain = $1',
      [subdomain]
    );

    if (subdomainCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Subdomain already exists',
      });
    }

    const tenantId = uuidv4();
    const adminId = uuidv4();
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await client.query(
      `INSERT INTO tenants
       (id, name, subdomain, status, subscription_plan, max_users, max_projects)
       VALUES ($1, $2, $3, 'active', 'free', 5, 3)`,
      [tenantId, tenantName, subdomain]
    );

    await client.query(
      `INSERT INTO users
       (id, tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5, 'tenant_admin')`,
      [adminId, tenantId, adminEmail, hashedPassword, adminFullName]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Tenant registered successfully',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('REGISTER TENANT ERROR:', err);

    return res.status(500).json({
      success: false,
      message: 'Tenant registration failed',
    });
  } finally {
    client.release();
  }
};

/**
 * API 2: Login  ✅ FIXED FOR SUPER ADMIN
 */
const login = async (req, res) => {
  const { email, password, tenantSubdomain } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  try {
    let user;

    /**
     * 🔐 SUPER ADMIN LOGIN (NO TENANT)
     */
    if (email === 'superadmin@system.com') {
      const result = await pool.query(
        `SELECT id, email, password_hash, full_name, role
         FROM users
         WHERE email = $1 AND role = 'super_admin'`,
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      user = result.rows[0];

    /**
     * 👥 TENANT USER LOGIN
     */
    } else {
      if (!tenantSubdomain) {
        return res.status(400).json({
          success: false,
          message: 'Tenant subdomain is required',
        });
      }

      const tenantResult = await pool.query(
        'SELECT id, status FROM tenants WHERE subdomain = $1',
        [tenantSubdomain]
      );

      if (tenantResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found',
        });
      }

      const tenant = tenantResult.rows[0];

      if (tenant.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Tenant is not active',
        });
      }

      const userResult = await pool.query(
        `SELECT id, email, password_hash, full_name, role, tenant_id
         FROM users
         WHERE email = $1 AND tenant_id = $2`,
        [email, tenant.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      user = userResult.rows[0];
    }

    // 🔑 PASSWORD CHECK (COMMON)
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken({
      userId: user.id,
      tenantId: user.tenant_id || null,
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: user.tenant_id || null,
        },
        token,
        expiresIn: 86400,
      },
    });
  } catch (err) {
    console.error('LOGIN CRASH:', err);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};

/**
 * API 3: Get Current User
 * (UNCHANGED)
 */
const getCurrentUser = async (req, res) => {
  try {
    const userResult = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.role, u.is_active,
              t.id AS tenant_id, t.name, t.subdomain,
              t.subscription_plan, t.max_users, t.max_projects
       FROM users u
       LEFT JOIN tenants t ON u.tenant_id = t.id
       WHERE u.id = $1`,
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = userResult.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        tenantId: user.tenant_id,
        tenant: user.tenant_id
          ? {
              id: user.tenant_id,
              name: user.name,
              subdomain: user.subdomain,
              subscriptionPlan: user.subscription_plan,
              maxUsers: user.max_users,
              maxProjects: user.max_projects,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('GET CURRENT USER ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch current user',
    });
  }
};

/**
 * API 4: Logout
 */
const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

module.exports = {
  registerTenant,
  login,
  getCurrentUser,
  logout,
};
