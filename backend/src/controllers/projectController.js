const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');

/**
 * API 12: Create Project
 */

const createProject = async (req, res) => {
  const { name, description, tenantId: bodyTenantId } = req.body;

  // ✅ Determine logical tenant ID
  let targetTenantId = req.user.tenantId;
  const isSuperAdmin = req.user.role === 'super_admin';

  if (isSuperAdmin) {
    if (!bodyTenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required for Super Admins',
      });
    }
    targetTenantId = bodyTenantId;
  }

  // ✅ Identify creator
  const creatorId = req.user.userId; // Projects created by Super Admin still show them as creator

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Project name is required',
    });
  }

  try {
    // Check project limit
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM projects WHERE tenant_id = $1`,
      [targetTenantId]
    );

    const projectCount = Number(countResult.rows[0].count);

    const tenantResult = await pool.query(
      `SELECT max_projects FROM tenants WHERE id = $1`,
      [targetTenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }

    const maxProjects = tenantResult.rows[0].max_projects;

    if (projectCount >= maxProjects) {
      return res.status(403).json({
        success: false,
        message: 'Project limit reached for this tenant',
      });
    }

    const projectId = uuidv4();

    const result = await pool.query(
      `INSERT INTO projects (id, tenant_id, name, description, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [projectId, targetTenantId, name, description || null, creatorId]
    );

    const project = result.rows[0];

    return res.status(201).json({
      success: true,
      data: {
        id: project.id,
        tenantId: project.tenant_id,
        name: project.name,
        description: project.description,
        status: project.status,
        createdBy: project.created_by,
        createdAt: project.created_at,
      },
    });

  } catch (error) {
    console.error('CREATE PROJECT ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create project',
    });
  }
};

/**
 * API 13: List Projects
 */

const listProjects = async (req, res) => {
  const { tenantId: userTenantId, role } = req.user;

  const {
    status,
    search,
    tenantId: queryTenantId,
    page = 1,
    limit = 20
  } = req.query;

  const offset = (page - 1) * limit;

  try {
    const conditions = [];
    const values = [];
    let index = 1;

    // ✅ Tenant Filter Logic
    if (role === 'super_admin') {
      // Super Admin can see all, or filter by specific tenant
      if (queryTenantId) {
        conditions.push(`p.tenant_id = $${index++}`);
        values.push(queryTenantId);
      }
      // If no queryTenantId, show ALL projects
    } else {
      // Regular users MUST be restricted to their tenant
      conditions.push(`p.tenant_id = $${index++}`);
      values.push(userTenantId);
    }

    if (status) {
      conditions.push(`p.status = $${index++}`);
      values.push(status);
    }

    if (search) {
      conditions.push(`p.name ILIKE $${index++}`);
      values.push(`%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM projects p ${whereClause}`,
      values
    );

    const total = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    // Fetch projects
    const projectsResult = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.status,
        p.created_at,
        p.tenant_id,  -- ✅ Include tenant_id for context
        t.name AS tenant_name, -- ✅ Join with tenants to show name
        u.id AS creator_id,
        u.full_name AS creator_name
      FROM projects p
      JOIN users u ON u.id = p.created_by
      JOIN tenants t ON t.id = p.tenant_id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${index++} OFFSET $${index}
      `,
      [...values, limit, offset]
    );

    const projects = projectsResult.rows.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      createdBy: {
        id: p.creator_id,
        fullName: p.creator_name
      },
      createdAt: p.created_at
    }));

    return res.status(200).json({
      success: true,
      data: {
        projects,
        total,
        pagination: {
          currentPage: Number(page),
          totalPages,
          limit: Number(limit)
        }
      }
    });

  } catch (error) {
    console.error('LIST PROJECTS ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
};

/**
 * API 14: Update Project
 */
const updateProject = async (req, res) => {
  const { projectId } = req.params;
  const { tenantId, userId, role } = req.user;
  const { name, description, status } = req.body;

  try {
    // Get project
    const projectResult = await pool.query(
      `SELECT id, tenant_id, created_by FROM projects WHERE id = $1`,
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const project = projectResult.rows[0];

    // Tenant check
    if (project.tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    // Authorization: admin OR creator
    if (role !== 'tenant_admin' && project.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project',
      });
    }

    // Build update query
    const fields = [];
    const values = [];
    let index = 1;

    if (name !== undefined) {
      fields.push(`name = $${index++}`);
      values.push(name);
    }

    if (description !== undefined) {
      fields.push(`description = $${index++}`);
      values.push(description);
    }

    if (status !== undefined) {
      fields.push(`status = $${index++}`);
      values.push(status);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided for update',
      });
    }

    const updateResult = await pool.query(
      `
      UPDATE projects
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${index}
      RETURNING id, name, description, status, updated_at
      `,
      [...values, projectId]
    );

    const updatedProject = updateResult.rows[0];

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: {
        id: updatedProject.id,
        name: updatedProject.name,
        description: updatedProject.description,
        status: updatedProject.status,
        updatedAt: updatedProject.updated_at,
      },
    });

  } catch (error) {
    console.error('UPDATE PROJECT ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update project',
    });
  }
};

/**
 * API 15: Delete Project
 */
const deleteProject = async (req, res) => {
  const { projectId } = req.params;
  const { tenantId, userId, role } = req.user;

  try {
    // Get project
    const projectResult = await pool.query(
      `SELECT id, tenant_id, created_by FROM projects WHERE id = $1`,
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const project = projectResult.rows[0];

    // Must belong to same tenant
    if (project.tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Only tenant_admin or creator
    if (role !== 'tenant_admin' && project.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Delete project
    await pool.query(
      `DELETE FROM projects WHERE id = $1`,
      [projectId]
    );

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });

  } catch (error) {
    console.error('DELETE PROJECT ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete project',
    });
  }
};

module.exports = {
  createProject,
  listProjects,
  updateProject,
  deleteProject
};