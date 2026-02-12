const pool = require('../config/db');
const { logAction } = require('../services/auditService');

/**
 * API 10: Update User
 */
const updateUser = async (req, res) => {
  const { userId } = req.params;
  const {
    userId: requesterId,
    tenantId: requesterTenantId,
    role: requesterRole
  } = req.user;

  const { fullName, role, isActive } = req.body;

  try {
    // Get target user
    const userResult = await pool.query(
      `SELECT id, tenant_id, role FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const targetUser = userResult.rows[0];

    // Must belong to same tenant
    if (targetUser.tenant_id !== requesterTenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    const isSelf = requesterId === userId;

    // Self user restrictions
    if (isSelf && (role !== undefined || isActive !== undefined)) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your full name',
      });
    }

    // Non-admin trying to update others
    if (!isSelf && requesterRole !== 'tenant_admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user',
      });
    }

    // Build update query
    const fields = [];
    const values = [];
    let index = 1;

    if (fullName !== undefined) {
      fields.push(`full_name = $${index++}`);
      values.push(fullName);
    }

    if (requesterRole === 'tenant_admin') {
      if (role !== undefined) {
        fields.push(`role = $${index++}`);
        values.push(role);
      }
      if (isActive !== undefined) {
        fields.push(`is_active = $${index++}`);
        values.push(isActive);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update',
      });
    }

    const updateResult = await pool.query(
      `
      UPDATE users
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${index}
      RETURNING id, full_name, role,is_active ,updated_at
      `,
      [...values, userId]
    );

    const updatedUser = updateResult.rows[0];



    // Audit Log
    await logAction(
      targetUser.tenant_id,
      requesterId,
      'UPDATE_USER',
      'user',
      userId,
      req.ip
    );

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: updatedUser.id,
        fullName: updatedUser.full_name,
        role: updatedUser.role,
        isActive: updatedUser.is_active,
        updatedAt: updatedUser.updated_at,
      },
    });
  } catch (error) {
    console.error('UPDATE USER ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
    });
  }
};

/**
 * API 11: Delete User
 */
const deleteUser = async (req, res) => {
  const { userId } = req.params;
  const {
    userId: requesterId,
    tenantId: requesterTenantId,
    role: requesterRole
  } = req.user;

  try {
    // Only tenant_admin can delete
    if (requesterRole !== 'tenant_admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete users',
      });
    }

    // tenant_admin cannot delete themselves
    if (requesterId === userId) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete yourself',
      });
    }

    // Get target user
    const userResult = await pool.query(
      `SELECT id, tenant_id FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const targetUser = userResult.rows[0];

    // Must belong to same tenant
    if (targetUser.tenant_id !== requesterTenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    // Delete user
    await pool.query(
      `DELETE FROM users WHERE id = $1`,
      [userId]
    );



    // Audit Log
    await logAction(
      targetUser.tenant_id,
      requesterId,
      'DELETE_USER',
      'user',
      userId,
      req.ip
    );

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });

  } catch (error) {
    console.error('DELETE USER ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};

module.exports = {
  updateUser,
  deleteUser,
};