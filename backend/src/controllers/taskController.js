const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');

/**
 * API 16: Create Task
 */

/**
 * API 16: Create Task
 */
const createTask = async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assignedTo, priority = 'medium', dueDate } = req.body;
  const { tenantId: requesterTenantId, role } = req.user;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: 'Task title is required',
    });
  }

  try {
    // Check project exists
    const projectResult = await pool.query(
      `SELECT id, tenant_id FROM projects WHERE id = $1`,
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const project = projectResult.rows[0];

    // ✅ Authorization: Enforce tenant check only for non-Super Admins
    if (role !== 'super_admin' && project.tenant_id !== requesterTenantId) {
      return res.status(403).json({
        success: false,
        message: 'Project does not belong to your tenant',
      });
    }

    //  Validate assigned user (if provided)
    if (assignedTo) {
      // ✅ Super Admin can assign anybody? Or still restrict to project's tenant?
      // Safer to restrict to project's tenant
      const userResult = await pool.query(
        `SELECT id FROM users WHERE id = $1 AND tenant_id = $2`,
        [assignedTo, project.tenant_id]
      );

      if (userResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user does not belong to this tenant',
        });
      }
    }

    //  Create task
    const taskId = uuidv4();

    const result = await pool.query(
      `
      INSERT INTO tasks
      (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date)
      VALUES ($1, $2, $3, $4, $5, 'todo', $6, $7, $8)
      RETURNING *
      `,
      [
        taskId,
        projectId,
        project.tenant_id,
        title,
        description || null,
        priority,
        assignedTo || null,
        dueDate || null,
      ]
    );

    const task = result.rows[0];

    return res.status(201).json({
      success: true,
      data: {
        id: task.id,
        projectId: task.project_id,
        tenantId: task.tenant_id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assigned_to,
        dueDate: task.due_date,
        createdAt: task.created_at,
      },
    });

  } catch (error) {
    console.error('CREATE TASK ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create task',
    });
  }
};

/**
 * API 17: List Tasks in Project
 */
const listTasks = async (req, res) => {
  const { projectId } = req.params;
  const { tenantId, role } = req.user;

  const { status, priority, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // ✅ Check project exists & belongs to tenant (if not super admin)
    let projectResult;
    if (role === 'super_admin') {
      projectResult = await pool.query(
        `SELECT id FROM projects WHERE id = $1`,
        [projectId]
      );
    } else {
      projectResult = await pool.query(
        `SELECT id FROM projects WHERE id = $1 AND tenant_id = $2`,
        [projectId, tenantId]
      );
    }

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Filters
    const conditions = [`t.project_id = $1`];
    const values = [projectId];
    let index = 2; // Start index after projectId

    // ✅ For regular users, enforce tenant_id check on tasks too (redundant but safe)
    if (role !== 'super_admin') {
      conditions.push(`t.tenant_id = $${index++}`);
      values.push(tenantId);
    }

    if (status) {
      conditions.push(`t.status = $${index++}`);
      values.push(status);
    }

    if (priority) {
      conditions.push(`t.priority = $${index++}`);
      values.push(priority);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    //  Count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM tasks t ${whereClause}`,
      values
    );

    const total = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    //  Fetch tasks
    const tasksResult = await pool.query(
      `
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.created_at,
        u.id AS assigned_to_id,
        u.full_name AS assigned_to_name
      FROM tasks t
      LEFT JOIN users u ON u.id = t.assigned_to
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT $${index++} OFFSET $${index}
      `,
      [...values, limit, offset]
    );

    const tasks = tasksResult.rows.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      dueDate: t.due_date,
      assignedTo: t.assigned_to_id
        ? {
          id: t.assigned_to_id,
          fullName: t.assigned_to_name,
        }
        : null,
      createdAt: t.created_at,
    }));

    return res.status(200).json({
      success: true,
      data: {
        tasks,
        total,
        pagination: {
          currentPage: Number(page),
          totalPages,
          limit: Number(limit),
        },
      },
    });

  } catch (error) {
    console.error('LIST TASKS ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
    });
  }
};
/**
 * API 18: Update Task Status
 */
const updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;
  const { tenantId } = req.user;

  const allowedStatuses = ['todo', 'in_progress', 'completed'];

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status value',
    });
  }

  try {
    // 1️⃣ Verify task belongs to tenant
    const taskResult = await pool.query(
      `SELECT id FROM tasks WHERE id = $1 AND tenant_id = $2`,
      [taskId, tenantId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Task does not belong to your tenant',
      });
    }

    // 2️⃣ Update only status
    const updateResult = await pool.query(
      `
      UPDATE tasks
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, status, updated_at
      `,
      [status, taskId]
    );

    return res.status(200).json({
      success: true,
      data: {
        id: updateResult.rows[0].id,
        status: updateResult.rows[0].status,
        updatedAt: updateResult.rows[0].updated_at,
      },
    });

  } catch (error) {
    console.error('UPDATE TASK STATUS ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update task status',
    });
  }
};
/**
 * API 19: Update Task (FULL FIX)
 */
const updateTask = async (req, res) => {
  const { projectId, taskId } = req.params;
  const { tenantId } = req.user;

  const {
    title,
    description,
    priority,
    status,        // ✅ ADD THIS
    assignedTo,
    dueDate,
  } = req.body;

  try {
    // 1️⃣ Check task exists & belongs to tenant & project
    const taskResult = await pool.query(
      `
      SELECT id 
      FROM tasks 
      WHERE id = $1 AND project_id = $2 AND tenant_id = $3
      `,
      [taskId, projectId, tenantId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // 2️⃣ Build update query dynamically
    const fields = [];
    const values = [];
    let index = 1;

    if (title !== undefined) {
      fields.push(`title = $${index++}`);
      values.push(title);
    }

    if (description !== undefined) {
      fields.push(`description = $${index++}`);
      values.push(description);
    }

    if (priority !== undefined) {
      fields.push(`priority = $${index++}`);
      values.push(priority);
    }

    // ✅ THIS IS THE MISSING PART (STATUS FIX)
    if (status !== undefined) {
      const allowedStatuses = ['todo', 'in_progress', 'completed'];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value',
        });
      }

      fields.push(`status = $${index++}`);
      values.push(status);
    }

    if (assignedTo !== undefined) {
      fields.push(`assigned_to = $${index++}`);
      values.push(assignedTo);
    }

    if (dueDate !== undefined) {
      fields.push(`due_date = $${index++}`);
      values.push(dueDate);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided for update',
      });
    }


    const updateResult = await pool.query(
      `
      UPDATE tasks
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${index}
      RETURNING id, title, description, priority, assigned_to, due_date, updated_at
      `,
      [...values, taskId]
    );

    const task = updateResult.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        assignedTo: task.assigned_to,
        dueDate: task.due_date,
        updatedAt: task.updated_at,
      },
    });

  } catch (error) {
    console.error('UPDATE TASK ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update task',
    });
  }
};
/**
 * API 20: Delete Task
 */
const deleteTask = async (req, res) => {
  const { projectId, taskId } = req.params;
  const { tenantId } = req.user;

  try {
    // Verify task belongs to tenant & project
    const taskResult = await pool.query(
      `
      SELECT id 
      FROM tasks
      WHERE id = $1 AND project_id = $2 AND tenant_id = $3
      `,
      [taskId, projectId, tenantId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Delete task
    await pool.query(
      `DELETE FROM tasks WHERE id = $1`,
      [taskId]
    );

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('DELETE TASK ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete task',
    });
  }
};

module.exports = {
  createTask,
  listTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
};